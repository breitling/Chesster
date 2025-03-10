import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { AutoFocusModule } from 'primeng/autofocus';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';

import { DataService } from '../Services/DataService.service';
import { Database } from '../Models/Database';
import { FileselectionComponent } from "../fileselection/fileselection.component";
import { DialogModule } from 'primeng/dialog';
import { Message, MessageModule } from 'primeng/message';

@Component({
    selector: 'app-databases',
    standalone: true,
    imports: [CommonModule, ButtonModule, TableModule, InputTextModule, TextareaModule, FormsModule, AutoFocusModule, TooltipModule,
              FileUploadModule, FileselectionComponent, DialogModule, MessageModule],
    providers: [],
    templateUrl: './databases.component.html',
    styleUrl: './databases.component.scss'
})
export class DatabasesComponent implements OnInit {

    databases : Database [];
    selectedDatabase!: Database;

    adding : boolean;
    updating : boolean;

    id : string;
    name : string;
    notes : string;
    path : string;

    visible : boolean = false;
    showMessages : boolean = false;
    databaseExists : boolean = false;

    messages = signal<any []>([]);

    constructor(private dataService : DataService) {
        this.databases = [];
        this.messages.set([]);

        this.adding = false;
        this.updating = false;

        this.id = '';
        this.name = '';
        this.path = '';
        this.notes = '';
    }

    public ngOnInit() {
        this.getDatabases();
    }

    public getDatabases() {
        this.adding = false;
        this.dataService.getDatabases().then(
            (data) => {
                this.databases = data;
            },
            (error : string) => {
                console.log(error);
            }
        );
    }

    public onRowSelect(event: any) {
        this.id = this.selectedDatabase.id;
        this.name = this.selectedDatabase.ds.name;
        this.path = this.selectedDatabase.ds.path;
        this.notes = this.selectedDatabase.notes;

        this.adding = false;
        this.updating = true;

        this.databaseExists = this.dataService.databaseExists(this.selectedDatabase.ds.name);

        this.dataService.setDatabase(this.selectedDatabase);
        this.dataService.setCurrentGames([]);
        this.dataService.setChessPositionBoard('8/8/8/8/8/8/8/8');
    }

    public onRowUnselect(event: any) {
        this.updating = false;
    }

    public selectFile() {
        this.visible = true;
    }

    public addDatabase() {
        if (this.adding == false) {
            this.adding = true;
            this.updating = false;
            this.initialize();
        } else {
            this.adding = false;
        }
    }

    public doesDatabaseExists() : boolean {
        return this.databaseExists;
    }

    public fileExists() : boolean {
        return this.dataService.exists(this.selectedDatabase.ds.path);
    }

    public delete() {
        const b = this.dataService.deleteDatabase(this.selectedDatabase.id);

        if (b)
            this.messages.set([{ severity : 'success', text: 'Sucessfully deleted database.'}]);
        else
            this.messages.set([{ severity : 'error', text: 'Error deleting database.'}]);
    }
    
    public import() {
        this.dataService.import(this.id).then(
            (results) => {
                this.messages.set([{ severity : 'success', text: 'Sucessfully imported games.'}]);
            },
            (error : string) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

    public save() {
        const message = this.dataService.saveDatabase(this.name, this.path, this.notes);
        const severity = (message.indexOf('Failed') > 0) ? 'error' : 'success';

        this.messages.set([{ severity : severity, text: message}]);
    }

    public saveAndImport() {
        this.save();
        this.import();
    }

    public update() {
        const message = this.dataService.updateDatabase(this.id, this.name, this.path, this.notes);
        const severity = (message.indexOf('Failed') > 0) ? 'error' : 'success';

        this.messages.set([{ severity : severity, detail: message}]);
    }

    public setSelectedFile(node : any) {
        this.visible = false;
        this.path = node.data;
    }

//  PRIVATE METHODS

    private initialize() {
        this.id = '';
        this.name = '';
        this.path = '';
        this.notes = '';
    }
}
