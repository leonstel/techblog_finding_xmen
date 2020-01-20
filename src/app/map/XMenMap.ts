import {googleMapsInstance} from "./GoogleMapsInstance";
import {recruit} from "../utils";
import {MapBase} from "./MapBase";
import {Location, Mutant, MutantMarker, MutantType} from "./markers";
import Store, {ProfX} from '../store';

export class XMenMap extends MapBase{

    constructor(){
        const xmenMapContainer = document.querySelector('#xmen-map');
        super(xmenMapContainer);

        const apiMutants = Store.get('apiMutants');
        const wolverine = apiMutants.xmen.wolverine;

        // listen for realTimeLocation and mapInit but wait for professorX, observable stream
        this.listToPropAfterMapInit('realTimeLocation', 'professorX').subscribe((loc: Location) => {

            if(loc){
                // because the listener is only getting fired if the professorX exists in store, we can be
                // certain that it is not undefined
                const professorX: ProfX = Store.get('professorX');
                googleMapsInstance.move(loc, professorX.id);

                const isRecruiting: boolean = Store.get('isRecruiting');
                if(!isRecruiting){
                    googleMapsInstance.moveTo(wolverine.id, professorX.id);
                }

                // let the recruited ones follow professorX
                const recruited: string[] = Store.get('recruited').filter( id => id !== wolverine.id && id !== professorX.id );
                recruited.forEach((mId: string) => {
                    googleMapsInstance.moveTo(mId, professorX.id);
                });

                googleMapsInstance.discoverMutants();
            }

        });

        // the second argument indicates that it waits on professorX to be defined
        this.listToPropAfterMapInit('professorX', 'professorX').subscribe((profX: ProfX) => {
            googleMapsInstance.changeProfXRange(profX.radius);
        });
    }

    doMapInitLogic(): void {
        this.mapIsInitialized();
    }

    firstAfterMapInitialize(): void {
        // TODO do some panning or so for demonstration purpose
    }

    // to show multiple ways to do the same thing with google maps
    markerClicked(marker: MutantMarker): void {
        recruit(marker.data.mutant.id);
    }

}
