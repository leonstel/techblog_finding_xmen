import {mapStyles} from "./mapStyles";
import {IMap, MapBase} from "./MapBase";
import Store, {defaultLocation} from "../store";
import {randomInBetween} from "../utils";
import {
    createAlphaMutant,
    createBetaMutant,
    createProfessorX,
    createXMen, isDiscoverableMutant,
    Location, markerIsInProfXRange,
    Mutant,
    MutantMarker,
    MutantType
} from "./markers";
import LatLng = google.maps.LatLng;

// this property is being used by external lit elements to get access to the googleMapInstance
export let googleMapsInstance: GoogleMapsInstance | undefined;

export const initGoogleMaps: () => void = (): void => {
    if(!googleMapsInstance) {
        googleMapsInstance = new GoogleMapsInstance();
    }
};

export class GoogleMapsInstance {
    private googleMaps: google.maps.Map;
    public el: HTMLElement;
    private context: IMap;

    private markers: MutantMarker[] = [];

    constructor() {
        console.log('Gmap pinstnace construct');

        this.el = document.createElement('div');
        this.el.setAttribute('id', 'map');

        const location = Store.get('realTimeLocation');

        this.googleMaps = new google.maps.Map(this.el, {
            center: new google.maps.LatLng(defaultLocation.lat, defaultLocation.lon),
            // @ts-ignore
            styles: mapStyles,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
            clickableIcons: true,
            draggable: true,
            zoom: 13,
        });
    }

    public getGmapObj(){
        return this.googleMaps;
    }

    public setContext(context: MapBase): void {
        this.context = context;
    }

    private addMarker(marker: MutantMarker): void {
        if(!this.context) throw Error('no context has been set');

        marker.addListener('click', this.markerClickHandler.bind(this, marker));
        this.markers = [
            ...this.markers,
            marker,
        ];
        marker.setVisible(false);
        marker.setMap(this.googleMaps);
    }

    // show all if no type has been passed along
    public show(mutantType?: MutantType): void {
        this.markers.forEach( (marker: MutantMarker) => {
            if (!mutantType || marker.data.mutantType === mutantType) {
                marker.setVisible(true);
            }
        });
    }

    public hide(mutantType?: MutantType): void {
        this.markers.forEach( (marker: MutantMarker) => {
            if (!mutantType || marker.data.mutantType === mutantType)
                marker.setVisible(false);
        });
    }

    markerClickHandler(marker: MutantMarker){
        this.context.markerClicked(marker);
    }

    private getMarkerOfId(mutantId: string): MutantMarker | undefined {
        return this.markers.find((marker: MutantMarker) => marker.data.mutant.id === mutantId)
    }

    private getMarkerOfType(mutantType: MutantType): MutantMarker | undefined {
        return this.markers.find((marker: MutantMarker) => marker.data.mutantType === mutantType)
    }

    public addMutants(mutants: Mutant[], type: MutantType): void {
        mutants.forEach((mutant: Mutant): void => this.addMutant(mutant, type));
    }

    public addMutant(mutant: Mutant, type: MutantType): void {
        let marker: MutantMarker;
        switch (type) {
            case MutantType.Alpha:
                marker = createAlphaMutant(mutant);
                break;
            case MutantType.Beta:
                marker = createBetaMutant(mutant);
                break;
            case MutantType.Wolverine:
                marker = createXMen(mutant, MutantType.Wolverine);
                break;
            case MutantType.ProfessorX:
                marker = createProfessorX({lat:0,lon:0},mutant, this);
                break;
            default:
                throw Error('MARKER TYPE NOT FOUND');
        }

        marker.setVisible(true);
        this.addMarker(marker);
    }

    // if professor X does not exists yet create marker
    public move(loc: Location, mutantId: string): void {
        const mutantMarker = this.getMarkerOfId(mutantId);
        if (mutantMarker){
            const realtimeLatLng: google.maps.LatLng = new google.maps.LatLng(loc.lat, loc.lon);
            mutantMarker.setPosition(realtimeLatLng);

            // if professor move circle as wel
            if(mutantMarker.data.mutantType === MutantType.ProfessorX){
                mutantMarker.data.drawing.setCenter(realtimeLatLng);
            }
        }else{
            console.error(`A marker with id ${mutantId} does not exists on map`)
        }
    }

    public moveTo(toBeMovedId: string, targetId: string){
        const targetMarker = this.getMarkerOfId(targetId);

        const max = 0.01;
        const min = -0.01;

        const [offset1, offset2] = [
            randomInBetween(max,min),
            randomInBetween(max,min),
        ];

        const targetLocation: Location = {
            lat: targetMarker.getPosition().lat() + offset1,
            lon: targetMarker.getPosition().lng() + offset2
        };
        this.move(targetLocation, toBeMovedId)
    }

    public panTo(mutantId: string): void {
        const mutantMarker = this.getMarkerOfId(mutantId);
        if (mutantMarker) {
            const pos: LatLng = mutantMarker.getPosition();
            this.googleMaps.panTo(new google.maps.LatLng(pos.lat(), pos.lng()));
        }
    }

    public changeProfXRange(radius){
        const marker = this.getMarkerOfType(MutantType.ProfessorX);
        if(!marker) throw Error('could not change rang of profx, marker not found');
        marker.data.drawing.setRadius(radius);
    }

    public discoverMutants(){
        const profXMarker = this.getMarkerOfType(MutantType.ProfessorX);
        if(!profXMarker) throw Error('could not change rang of profx, marker not found');

        const recruited: string[] = Store.get('recruited');
        const mutantsInRange: string[] = this.markers
            .filter((marker: MutantMarker) => {
                // only check if marker is not yet recruited and is a discoverable mutant
                if(isDiscoverableMutant(marker) && !recruited.find( id => id === marker.data.mutant.id)){
                    return markerIsInProfXRange(marker, profXMarker)
                }
                return false;
            })
            .map((marker:MutantMarker)=> marker.data.mutant.id);

        const currentDiscoveredMutants: string[] = Store.get('discovered');

        // set because every item must be unique
        const uniqueSet: Set<string> = new Set([
            ...currentDiscoveredMutants,
            ...mutantsInRange
        ]);
        const discoveredMutants = [...uniqueSet];

        Store.set('discovered', discoveredMutants);
    }

    public recruit(mutantId: string): PromiseLike<void>{
        return new Promise((resolve, reject) => {
            Store.set('isRecruiting', true);

            const apiMutants = Store.get('apiMutants');
            const wolverine = apiMutants.xmen.wolverine;

            this.moveTo(wolverine.id, mutantId);

            setTimeout(() => {
                Store.set('isRecruiting', false);
                resolve();
            },1500);
        });
    }
}
