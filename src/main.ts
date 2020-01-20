import {loadGoogleMapScripts} from "./app/init";
import {firstTimeTrue} from "./app/utils";
import {initializeRealtimePosition} from "./app/position";
import Store from './app/store';
import {googleMapsInstance} from "./app/map/GoogleMapsInstance";
import {XMenMap} from "./app/map/XMenMap";
import {MutantType} from "./app/map/markers";
import {UI} from "./app/UI";

const apiMutants = require('./mutants.json');

loadGoogleMapScripts();
initializeRealtimePosition();

Store.set('professorX', {
    ...apiMutants.xmen.professorX,
    radius: 1500
});
Store.set('apiMutants', apiMutants);

new UI();
new XMenMap();

firstTimeTrue('mapInit').subscribe(() => {
    googleMapsInstance.addMutants(apiMutants.alpha, MutantType.Alpha);
    googleMapsInstance.addMutants(apiMutants.beta, MutantType.Beta);
    googleMapsInstance.addMutant(apiMutants.xmen.wolverine, MutantType.Wolverine);
    googleMapsInstance.addMutant(apiMutants.xmen.professorX, MutantType.ProfessorX);

    Store.set('recruited', [
        apiMutants.xmen.professorX.id,
        apiMutants.xmen.wolverine.id
    ]);

    googleMapsInstance.show();
});

//https://developers.google.com/maps/documentation/utilities/polylineutility
