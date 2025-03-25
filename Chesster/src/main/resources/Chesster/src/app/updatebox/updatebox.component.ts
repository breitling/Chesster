import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { Game } from '../Models/Game';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { DataService } from '../Services/DataService.service';
import { Database } from '../Models/Database';
import { Variation } from '../Models/Variation';

@Component({
    selector: 'updatebox',
    standalone: true,
    imports: [CommonModule,FlexLayoutModule,ButtonModule,FormsModule,InputTextModule,TextareaModule,MessageModule],
    templateUrl: './updatebox.component.html',
    styleUrl: './updatebox.component.scss',
    providers: [MessageService]
})
export class UpdateBoxComponent implements OnChanges {

    @Input() public game : Game;
    @Input() public title : string;

    @Output() cancelEvent = new EventEmitter<number>();

    public database : Database;

    public messages = signal<any []>([]);

    constructor(private messageService: MessageService, private dataService : DataService) {
        this.title = 'Save';
        this.database = dataService.getDatabase();
        this.game = dataService.createGame();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        console.log('U:' + this.game.id);
    }

//  CALLBACKS
    
    public saveGame() {
        if (this.game.id === '') {
            const g = this.dataService.cloneGame(this.game);
            const data = JSON.stringify(this.convertVariations(g.variations));

            g.variations = [];

            this.dataService.saveGame(this.database.id, g, data, true).then(
                (responce) => {
                    this.messages.set([{ severity : 'success', text: 'Game saved.'}]);
                },
                (error) => {
                    this.messages.set([{ severity : 'error', text: error}]);
                }
            );
        }
    }

    public updateGame() {
        if (this.game.id !== '') {
            const g = this.dataService.cloneGame(this.game);
            const data = JSON.stringify(this.convertVariations(g.variations));

            g.variations = [];

            this.dataService.updateGame(this.database.id, g, data).then(
                (responce) => {
                    this.messages.set([{ severity : 'success', text: 'Game updated.'}]);
                },
                (error) => {
                    this.messages.set([{ severity : 'error', text: error}]);
                }
            );
        }
    }

    public cancel() {
        this.cancelEvent.emit(0);
    } 

//  PRIVATE METHODS

    private convertVariations(variations : Variation []) : any [] {
        const data : any [] = [];

        variations.forEach(v => {
            if (v.index > 0)
                data.push({ index: v.index, moves: v.moves, fen: v.startingFen });
        });

        return data;
    }
}
