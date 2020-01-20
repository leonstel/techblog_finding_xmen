import {Location} from "./map/markers";
import Store from "./store";


export const initializeRealtimePosition = (): void => {
    const simulationPath = [
        [51.80634, 4.72271],
        [51.81363, 4.71767],
        [51.82297, 4.70977],
        [51.82276, 4.69398],
        [51.82000, 4.68230],
        [51.81470, 4.67406],
        [51.80875, 4.66994],
        [51.80260, 4.67921],
        [51.79899, 4.68642],
        [51.79750, 4.71011],
    ];

    let current = 0;

    setInterval(() => {
        const location: Location = {
            lat: simulationPath[current][0],
            lon: simulationPath[current][1]
        };

        Store.set('realTimeLocation', location);

        if (current === simulationPath.length-1) current = 0;
        else  current ++;

    }, 2000)
};

