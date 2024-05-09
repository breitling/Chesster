import { Injectable } from "@angular/core";

@Injectable()
export class DataService {

    private javaConnector: Function;

    constructor () {
        this.javaConnector = () => { return 'TBI'; };
    }

//  GETTERS AND SETTERS

    public getJavaConnector() : any {
        return this.javaConnector();
    }

    public setJavaConnector(f : Function) {
        this.javaConnector = f;
    }
}