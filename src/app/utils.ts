import Store from "./store";
import {filter, first, mergeMap, switchMap} from "rxjs/operators";
import {iif, of} from "rxjs";
import {googleMapsInstance} from "./map/GoogleMapsInstance";

export const firstTimeTrue = (prop: any) => Store.changed(prop).pipe(
    mergeMap( (flag: boolean) => {
        return iif( () => flag, of(flag))
    }),
    first( (flag: boolean) => flag),
);

export const changedButWaitFor = (mainProp, ...ifDefinedProp) => {
    const waitIfDefinedProms = ifDefinedProp.map((prop) => {
        return Store.changed(prop)
            .pipe(
                filter( (val: any) => !!val),
                first()
            )
            .toPromise();
    });

    return Store.changed(mainProp).pipe(
        switchMap(async (res: any) => {
            await Promise.all(waitIfDefinedProms);
            return res
        }),
    );
};

export const randomInBetween = (max,min) => Math.random() * (max - min) + min;

export const recruit = async(mutantId: string) => {
    const discoveredRest = Store.get('discovered').filter( id => id !== mutantId);
    const recruited = Store.get('recruited');

    if(!mutantId) {
        alert('no mutant discovered!');
        return;
    }

    await googleMapsInstance.recruit(mutantId);

    Store.set('discovered', discoveredRest);
    Store.set('recruited', [
        ...recruited,
        mutantId
    ]);
};
