
import {BehaviorSubject, NEVER, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import {Location, Mutant} from "./map/markers";

export const defaultLocation: any = {
    lat:51.81066,
    lon:4.68368,
};

export interface ProfX extends Mutant {
    radius: number;
}

export interface ApiMutants {
    alpha: Mutant[],
    beta: Mutant[],
    xmen: {
        [key: string]: Mutant;
    }
}


interface State {
    mapLoaded: boolean;
    mapInit: boolean;
    realTimeLocation: Location;
    professorX: ProfX;
    apiMutants: any;
    recruited: string[];
    discovered: string[];
    isRecruiting: boolean;
}

class Store {

    //default state
    private state: State = {
        mapLoaded: false,
        mapInit: false,
        realTimeLocation: undefined,
        professorX: undefined,
        apiMutants: [],
        recruited: [],
        discovered: [],
        isRecruiting: false,
    };

    private changedObs = new BehaviorSubject<any>({current:this.state, prev: {}});

    set(name: any, val: any){
        if(!this.state.hasOwnProperty(name)) throw Error(`prop ${name} not defined in store!`);

        const prevState = this.state;
        this.state = {
            ...this.state,
            [name]: val,
        };

        this.changedObs.next({
            current: this.state,
            prev: prevState
        })
    }

    update(name: any, val: object){
        if(!this.state.hasOwnProperty(name)) throw Error(`prop ${name} not defined in store!`);

        val = this.state[name] =  {
            ...this.state[name],
            ...val
        };

        // json stringify is necessary for deep copy
        const prevState = JSON.stringify(this.state);       // reference necessary
        this.state = {
            ...this.state,
            [name]: val,
        };

        this.changedObs.next({
            current: this.state,
            prev: JSON.parse(prevState)
        })
    }

    get(name: any){
        return this.state[name];
    }

    changed(prop){
        if(!this.state.hasOwnProperty(prop)) throw Error('prop not defined in store! '+ prop, );
        return this.changedObs.pipe(
            switchMap((state, index) => {
                if(index === 0) return of(state.current[prop]);

                // could be better check but it is about the idea
                if(Array.isArray(state.current[prop])){
                    if(state.prev[prop].toString() !== state.current[prop].toString()) return of(state.current[prop])
                } else if(state.prev[prop] !== state.current[prop]) {
                    return of(state.current[prop]);
                }
                return NEVER;
            })
        );
    }
}

export default new Store();
