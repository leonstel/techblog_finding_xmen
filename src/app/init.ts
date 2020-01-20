import Store from "./store";

const addGoogleMapsScript = (): PromiseLike<void> => {
    return new Promise((resolve, reject) => {
        const googleMapsUrl: string = 'https://maps.googleapis.com/maps/api/js';

        if (!document.querySelectorAll(`[src="${googleMapsUrl}"]`).length) {
            document.body.appendChild(Object.assign(
                document.createElement('script'), {
                    type: 'text/javascript',
                    src: googleMapsUrl,
                    onload: (): void => {
                        resolve();
                    },
                    onerror: (e:any): void => {
                        reject();
                    },
                }));
        }
    });
};

export const loadGoogleMapScripts = (): void => {
    const loadGoogleMapsMainScript = addGoogleMapsScript();

    //Promise all because google maps have some things separated in different libs and different files
    Promise.all([loadGoogleMapsMainScript]).then(() => {
        Store.set('mapLoaded', true);
    }).catch((e:any) => {
        throw Error('Could not load Google Maps properly!');
    });
};
