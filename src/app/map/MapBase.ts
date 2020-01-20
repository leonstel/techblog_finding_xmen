import Store from "../store";
import {googleMapsInstance, initGoogleMaps} from "./GoogleMapsInstance";
import {timer} from "rxjs";
import {changedButWaitFor, firstTimeTrue} from "../utils";
import {MutantMarker} from "./markers";
import {takeUntil, tap} from "rxjs/operators";

export interface IMap {
    doMapInitLogic(): void;
    markerClicked(marker: MutantMarker): void;
}

export class MapBase implements IMap{
    protected googleMapsInstance;

    constructor(private element){
        if(!this.element) throw Error('html element required for MapBase');

        const TIMEOUT = 5000;
        const timer$ = timer(TIMEOUT).pipe(
            tap( x =>  {
                throw new Error(`Map took too long to load!, timeout is ${TIMEOUT}`)
            })
        );
        const mapLoaded = firstTimeTrue('mapLoaded').pipe(takeUntil(timer$));
        const mapInit = firstTimeTrue('mapInit');

        mapLoaded.subscribe( this.afterMapLoaded.bind(this));
        mapInit.subscribe( this.afterMapInit.bind(this));
    }

    private afterMapLoaded(){
        this.setupMap();
        this.doMapInitLogic();
    }

    protected mapIsInitialized(): void {
        Store.set('mapInit', true);
    }

    // Method to be overwritten
    afterMapInit(){}

    //SCENARIOS
    // TODO write scenarios for blog
    protected listToPropAfterMapInit = (prop: any, ...rest) => {
        const params = [
            prop,
            ...rest,
            'mapInit'
        ];
        return changedButWaitFor.apply(null, params);
    };

    private setupMap() {
        initGoogleMaps();
        this.googleMapsInstance = googleMapsInstance;
        this.googleMapsInstance.setContext(this);
        this.element.appendChild(googleMapsInstance.el);
    }

    // IMap interface methods, that must be overwritten by its children
    doMapInitLogic(): void {}
    markerClicked(marker: MutantMarker): void {}
}
