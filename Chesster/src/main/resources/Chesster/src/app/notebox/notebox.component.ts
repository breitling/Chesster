import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

import { DataService } from '../Services/DataService.service';
import { Game } from '../Models/Game';
import { Note } from '../Models/Note';
import { CheckboxModule } from 'primeng/checkbox';
import { Database } from '../Models/Database';

@Component({
    selector: 'notebox',
    standalone: true,
    imports: [CommonModule,ButtonModule,FormsModule,TextareaModule,CheckboxModule],
    templateUrl: './notebox.component.html',
    styleUrl: './notebox.component.scss'
})
export class NoteBoxComponent implements OnInit, OnChanges {

    @Input() public game : Game;

    public database : Database;

    public note : string = '';
    public notes : Note [];
    public checked : boolean [];

    private NOINDEX : number = -1;
    public index: number = this.NOINDEX;

    constructor(private messageService: MessageService, private dataService : DataService) {
        this.notes = [];
        this.checked = [];
        this.database = dataService.getDatabase();
        this.game = dataService.createGame();
    }

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.getData();
        console.log('N:' + this.game.id);
    }

//  CALLBACKS

    public addNote() {
        if (this.game && this.note.length > 0) {
            const note : Note = this.dataService.createNote(this.game.id);
            note.note = this.note;
            this.notes.push(note);
            this.checked.push(false);
            this.note = '';
        }
    }

    public deleteNotes() {
        const tempnotes = [];
        const tempchecked = [];

        for (var n = 0; n < this.notes.length; n++) {
            if (this.checked[n] == false) {
                tempnotes.push(this.notes[n]);
                tempchecked.push(false);
            } else {
                const note = this.notes[n];

                if (note.id.length > 0) {
                    this.dataService.deleteNote(this.database.id, note).then(
                        (r : boolean) => {
                            console.log('deleted '  + note.id);
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                }
            }
        }

        this.checked = tempchecked;
        this.notes = tempnotes;
    }

    public editNote() {
        let m = this.NOINDEX;
        let count = 0;

        for (var n = 0; n < this.notes.length; n++) {
            if (this.checked[n]) {
                m = n;
                count++;
            }
        }

        if (count === 1) {
            this.note = this.notes[m].note;
            this.checked[m] = false;
            this.index = m;
        }
    }

    public reset() {
        this.note = '';
        this.index = this.NOINDEX;
    }

    public saveNotes() {
        for (var n = 0; n < this.notes.length; n++) {
            if (this.checked[n]) {
                this.dataService.saveNote(this.database.id, this.notes[n]).then(
                    (r : boolean) => {
                        console.log('saved');
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            }
            this.checked[n] = false;
        }
    }

    public updateNote() {
        this.notes[this.index].note = this.note;
        this.index = this.NOINDEX;
        this.note = '';
    }

    public getBGC(n: number) {
        if (this.notes[n].id === '')
            return 'rose';
        else
            return 'black';
    }

//  PRIVATE METHODS

    private getData() {
        if (this.game.id != '') {
            console.log('Getting notes from backend');
            this.dataService.getNotes(this.database.id, this.game.id).then(
                (notes : Note []) => {
                    this.notes = notes;
                },
                (error) => {
                    console.log(error);
                }
            );
        }
    }
}
