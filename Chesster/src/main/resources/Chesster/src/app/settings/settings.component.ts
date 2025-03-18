import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

import { DataService } from '../Services/DataService.service';
import { SettingsService } from '../Services/SettingsService.service';
import { Settings } from '../Models/Settings';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule,FlexModule,ButtonModule,AccordionModule,FormsModule,InputTextModule,TextareaModule,MessageModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

    public settings : Settings;

    public messages = signal<any []>([]);

    constructor(private dataService : DataService, private settingsService : SettingsService) {
        this.settings = this.settingsService.createSettings();

        this.settings.chessdotcomAccount = 'bobbbo';
        this.settings.dbRoot = '/Users/bobbr/Desktop/Chess';
        this.settings.dbName = 'Testing';

        this.settingsService.load();
    }

    ngOnInit() {
        this.getData();
    }

//  CALLBACKS

    public save() {
        this.dataService.saveSettings(this.settings).then(
            (responce) => {
                this.messages.set([{ severity : 'success', text: 'Settings saved.'}]);
            },
            (error) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

    public reload() {
        this.settingsService.reload();
        this.getData();
    }

//  PRIVATE METHODS

    private getData() {
        this.settings = this.settingsService.getSettings();
    }
}
