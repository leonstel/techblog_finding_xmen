import {googleMapsInstance} from "./map/GoogleMapsInstance";
import Store, {ApiMutants} from '../app/store';
import {Mutant, MutantType} from "./map/markers";
import {firstTimeTrue, recruit, randomInBetween} from "./utils";

export class UI {

    private uiEl: Element;
    private XMenDiscoveredEl: Element;
    private XMenTeamEl: Element;

    constructor(){
        this.uiEl = document.querySelector('#ui');

        const template = document.createElement('template');
        let html = this.content();
        html = html.trim();
        template.innerHTML = html;
        const contentNode = template.content.firstChild;

        const mapLoaded = firstTimeTrue('mapInit');
        mapLoaded.subscribe( this.initListeners.bind(this));

        this.uiEl.append(contentNode);

        this.XMenTeamEl = document.querySelector('#xmen-team');
        this.XMenDiscoveredEl = document.querySelector('#xmen-discovered');
    }

    initListeners() {
        console.log('initListeners');
        const bindClickHandler = (el, func) => { this.uiEl.querySelector(el).addEventListener('click', func, false) };
        [
            ['#btn1', this.profXRangeClicked],
            ['#btn2', this.recruitClicked],
            ['#btn3', () => {this.toggleDisplay(MutantType.Alpha,true)}],
            ['#btn4', () => {this.toggleDisplay(MutantType.Alpha)}],
            ['#btn5', () => {this.toggleDisplay(MutantType.Beta,true)}],
            ['#btn6', () => {this.toggleDisplay(MutantType.Beta)}],
        ].forEach( ([el, func]) => bindClickHandler(el, func));

        const apiMutants: ApiMutants = Store.get('apiMutants');
        const mutantsList = [
            ...apiMutants.alpha,
            ...apiMutants.beta,
            ...Object.keys(apiMutants.xmen).map( key => apiMutants.xmen[key])
        ];

        Store.changed('discovered').subscribe((mutantIds: string[]) => {
            this.showInPanel(this.XMenDiscoveredEl, mutantIds, mutantsList)
        });

        Store.changed('recruited').subscribe((mutantIds: string[]) => {
            this.showInPanel(this.XMenTeamEl, mutantIds, mutantsList)
        });
    }

    content () {
        return `
            <div class="flex-column">
                <button id="btn1" class="normal-btn">Change prof X range</button>
                <button id="btn2" class="normal-btn">Recruit</button>
                <div class="ui-panel">
                    <p>Alpha</p>
                    <button id="btn3" class="small-btn hide-btn">Hide</button>
                    <button id="btn4" class="small-btn show-btn">Show</button>    
                </div>
                <div class="ui-panel">
                    <p>Beta</p>
                    <button id="btn5" class="small-btn hide-btn">Hide</button>
                    <button id="btn6" class="small-btn show-btn">Show</button>    
                </div>
                
                <div class="ui-panel mutant-panel">
                    <h3>Discovered</h3>
                    <div id="xmen-discovered" class="row mutant-panel-mutants"></div>   
                </div>
                
                <div class="ui-panel mutant-panel">
                    <h3>The X Men</h3>
                    <div id="xmen-team" class="row mutant-panel-mutants"></div>   
                </div>
            </div>
        `;
    }

    showInPanel(el, mutantIds, mutantsList){
        el.innerHTML = "";

        const mappedMutants = mutantIds.map( (id:string ) => mutantsList.find((m:Mutant) => id === m.id));
        mappedMutants.forEach( (m: Mutant) => {
            const imgEl: HTMLImageElement = document.createElement('img');
            imgEl.src = `assets/${m.img}`;
            imgEl.classList.add('mutant-img');
            imgEl.setAttribute('mutant-id',m.id);
            imgEl.addEventListener('click', this.mutantClicked.bind(this), false);
            el.append(imgEl);
        });
    }

    private mutantClicked(e){
        const mutantId: string = e.target.getAttribute('mutant-id');
        googleMapsInstance.panTo(mutantId)
    }

    private toggleDisplay(mutantType: MutantType, hide=false) {
        if(!hide) googleMapsInstance.show(mutantType);
        else googleMapsInstance.hide(mutantType);
    }

    private profXRangeClicked(){
        // for demo purposes random number
        // random between 500 and 1500
        const max = 2500;
        const min = 500;
        const randomRadius = Math.floor(randomInBetween(max,min));

        Store.update('professorX', {
            radius: randomRadius
        });
    }

    private async recruitClicked(){
        const [firstId] = Store.get('discovered');
        await recruit(firstId)
    }
}
