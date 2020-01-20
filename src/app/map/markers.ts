import {GoogleMapsInstance} from "./GoogleMapsInstance";
import Store, {ProfX} from '../../app/store';

export interface Location {
    lat: number;
    lon: number;
}

export interface Mutant {
    id: string;
    name: string;
    img: string;
    location?: Location;
}

export enum MutantType {
    Alpha = 'Alpha',
    Beta = 'Beta',
    Wolverine = 'Wolverine',
    ProfessorX = 'ProfessorX',      // is alpha level
}

export interface MutantMarker extends google.maps.Marker {
    data?: {
        mutant?: Mutant;
        drawing?: google.maps.Circle;
        mutantType: MutantType;
    };
    bounds?: google.maps.Polygon[];
}

export const isXMenMutant = (marker: MutantMarker): boolean => {
    return(
        marker.data.mutantType === MutantType.ProfessorX ||
        marker.data.mutantType === MutantType.Wolverine
    );
};

export const isDiscoverableMutant = (marker: MutantMarker): boolean => {
    return(
        marker.data.mutantType === MutantType.Alpha ||
        marker.data.mutantType === MutantType.Beta
    );
};

const defaultMarkerOptions = (lat: number, lng: number): google.maps.MarkerOptions => ({
    position: new google.maps.LatLng(lat, lng),
});

const createMarker = (lat: number, lng: number, mutantType: MutantType, options: google.maps.MarkerOptions = {}): MutantMarker => {
    let markerOptions = defaultMarkerOptions(lat, lng);
    markerOptions = {
        ...markerOptions,
        ...options,
    };

    const marker: MutantMarker = new google.maps.Marker(markerOptions);
    marker.data = {
        mutantType: mutantType,
    };
    return marker;
};

export const createAlphaMutant = (mutant: Mutant): MutantMarker => {
    const icon: google.maps.Icon = {
        url : `../../assets/${mutant.img}`,
        scaledSize: new google.maps.Size(70, 70),
        anchor: new google.maps.Point(35, 40),
        labelOrigin: new google.maps.Point(0,0)
    };

    const markerOptions: google.maps.MarkerOptions = {
        icon,
        label: `${mutant.name}`,

    };

    const marker: MutantMarker = createMarker(mutant.location.lat, mutant.location.lon, MutantType.Alpha, markerOptions);
    marker.data = {
        ...marker.data,
        mutant: <Mutant><unknown>{
            ...mutant,
        },
    };
    return marker;
};

export const createBetaMutant = (mutant: Mutant): MutantMarker => {

    const icon: google.maps.Icon = {
        url : `../../assets/${mutant.img}`,
        scaledSize: new google.maps.Size(70, 70),
        anchor: new google.maps.Point(35, 40),
    };

    const markerOptions: google.maps.MarkerOptions = {
        icon,
        label: `${mutant.name}`
    };

    const marker: MutantMarker = createMarker(mutant.location.lat, mutant.location.lon, MutantType.Beta, markerOptions);
    marker.data = {
        ...marker.data,
        mutant: <Mutant><unknown>{
            ...mutant,
        },
    };
    return marker;
};

export const createXMen = (mutant: Mutant, mutantType: MutantType): MutantMarker => {
    const icon: google.maps.Icon = {
        url : `../../assets/${mutant.img}`,
        scaledSize: new google.maps.Size(70, 70),
        anchor: new google.maps.Point(35, 40),
    };

    const markerOptions: google.maps.MarkerOptions = {
        icon,
        label: `${mutant.name}`
    };

    const marker: MutantMarker = createMarker(mutant.location.lat, mutant.location.lon, mutantType, markerOptions);
    marker.data = {
        ...marker.data,
        mutant: <Mutant><unknown>{
            ...mutant,
        },
    };
    return marker;
};

export const createProfessorX = (loc: Location, mutant: Mutant, googleMapInstance: GoogleMapsInstance): MutantMarker => {
    if(!googleMapInstance) throw Error('google map instance undefined!');

    const icon: google.maps.Icon = {
        url : `../../assets/${mutant.img}`,
        scaledSize: new google.maps.Size(70, 70),
        anchor: new google.maps.Point(35, 40),
    };

    const markerOptions: google.maps.MarkerOptions = {
        icon,
        label: mutant.name,
        zIndex: 1000
    };

    const marker: MutantMarker = createMarker(loc.lat, loc.lon, MutantType.ProfessorX, markerOptions);
    marker.data = {
        ...marker.data,
        mutant: <Mutant><unknown>{
            ...mutant,
        },
    };

    const profX: ProfX | undefined = Store.get('professorX');
    if(!profX) throw Error('no profx found in store while creating marker');

    // create drawing for prof X
    marker.data.drawing = new google.maps.Circle({
        center: new google.maps.LatLng(loc.lat, loc.lon),
        radius: profX.radius,
        map: googleMapInstance.getGmapObj(),
        fillColor: "#80c3e8",
        fillOpacity: 0.50,
        strokeColor: 'transparent',
        clickable: false,
    });

    return marker;
};

export const markerIsInProfXRange = (marker: MutantMarker, profXMarker: MutantMarker, range: number=0.002): boolean => {
    const profX: ProfX | undefined = Store.get('professorX');
    if(!profX){
        console.warn('no profx marker found for distance comparison');
        return false;
    }

    if(!marker.getVisible()) return false;

    const distance: number = google.maps.geometry.spherical.computeDistanceBetween (marker.getPosition(), profXMarker.getPosition());
    return distance < profX.radius;
};
