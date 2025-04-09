import { Injectable } from "@angular/core";
import { Settings } from "../Models/Settings";
import { DataService } from "./DataService.service";

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private loaded : boolean;
    private settings : Settings;

    constructor(private dataService : DataService) {
        this.loaded  = false;
        this.settings = this.createSettings();
    }

    public getSettings() : Settings {
        return this.settings;
    }

    public setSettings(s : Settings) {
        this.settings = s;
    }

    public async load() {
        if (this.loaded === false) {
            await this.dataService.loadSettings().then(
                (data) => {
                    this.settings = data;
                    this.loaded = true;
                    console.log('...');
                }
            );
            console.log('Done loading settings.');
        }
    }

    public async reload() {
        await this.dataService.loadSettings().then(
            (data) => {
                this.settings = data;
                console.log('...');
            }
        );
        console.log('Done reloading settings.');
    }

//  FACTORIES

    createSettings() : Settings {
        return { chessdotcomAccount: '', email: '', rating: 400, dbRoot: '', dbName: '' };
    }
    
//  GETTERS AND SETTERS

    public getChessDotComAccount() : string {
        return this.settings.chessdotcomAccount;
    }

    public getDbName() {
        return this.settings.dbName;
    }

    public getDbRoot() {
        return this.settings.dbRoot;
    }
}
