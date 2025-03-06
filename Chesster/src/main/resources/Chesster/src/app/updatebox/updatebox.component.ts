import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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

@Component({
    selector: 'updatebox',
    standalone: true,
    imports: [CommonModule,FlexLayoutModule,ButtonModule,FormsModule,InputTextModule,TextareaModule,MessageModule],
    templateUrl: './updatebox.component.html',
    styleUrl: './updatebox.component.scss',
    providers: [MessageService]
})
export class UpdateBoxComponent {

    @Input() public game : Game | undefined;
    @Input() public title : string;

    @Output() preloadEvent = new EventEmitter<Game>();
    @Output() cancelEvent = new EventEmitter<number>();

    public database : Database;

    public messages = signal<any []>([]);

    constructor(private messageService: MessageService, private dataService : DataService) {
        this.title = 'Save';
        this.database = dataService.getDatabase();
    }

//  CALLBACKS
    
    public saveGame() {
        if (this.game !== undefined)
            this.dataService.saveGame(this.database.id, this.game, true);

        this.messages.set([{ severity : 'success', text: 'Game saved.'}]);
    }

    public updateGame() {
        if (this.game !== undefined)
            this.dataService.updateGame(this.database.id, this.game);

        this.messages.set([{ severity : 'success', text: 'Game updated.'}]);
    }

    public cancel() {
        if (this.game?.id.length === 0)
            this.game = undefined;
        
        this.cancelEvent.emit(0);
    } 

    public load() {
        if (this.game)
            this.preloadEvent.emit(this.game);
    }    
}
