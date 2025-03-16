import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Game } from '../Models/Game';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';

import { ChessPositionComponent } from "../chessposition/chessposition.component";
import { DataService } from '../Services/DataService.service';
import { Database } from '../Models/Database';

@Component({
    selector: 'app-games',
    standalone: true,
    imports: [CommonModule,ButtonModule,TableModule,FormsModule,Message,InputTextModule,TextareaModule,ChessPositionComponent,PanelModule],
    templateUrl: './games.component.html',
    styleUrl: './games.component.scss'
})
export class GamesComponent implements OnInit {

    public database : Database;
    public games : Game [];
    public selectedGame! : Game;

    public messages = signal<any []>([]);

    public chessPositionBoard : string;

    @ViewChild("dbtable") table : ElementRef | undefined;
    @ViewChild("white") white : ElementRef | undefined;
    @ViewChild("board") board : any;
    
    constructor(private dataService : DataService) {
        this.games = [];
        this.database = dataService.getDatabase();
        this.dataService.unsetPreload();

        this.chessPositionBoard = dataService.getChessPositionBoard();
        this.messages.set([]);
    }

    public ngOnInit(): void {
        if (this.database) {
            this.games = this.dataService.getCurrentGames();

            if (this.games.length === 0) {
                this.getData();
            }
        }
    }

    public onRowSelect(event: any) {
        this.dataService.setSelectedGame(this.selectedGame);
        this.dataService.unsetPreload();
    }

    public onRowUnselect(event: any) {
        this.dataService.setSelectedGame(this.selectedGame); //NOTE: this.selectedGame is nothing
        this.chessPositionBoard = this.dataService.getChessPositionBoard();
    }

    public clear() {
        if (this.board) {
            this.board.clear();
            this.dataService.setChessPositionBoard('');
            this.getData();
        }
    }

    public find() {
        if (this.database && this.board) {
            const fen = this.board.fen();

            console.log(fen);
            this.dataService.setChessPositionBoard(fen);

            this.dataService.findGames(this.database.id, fen).then(
                (data) => {
                    this.games = data;
                    this.dataService.setCurrentGames(data);
                },
                (error : string) => {
                    console.log(error);
                }
            );
        }
    }

    public load() {
        console.log('Setting preload...');
        this.dataService.setPreload(this.selectedGame);
        this.messages.set([{ severity : 'success', text: 'Game preloaded.'}]);
    }

    public start() {
        if (this.board)
            this.board.start();
    }

    public update() {
        this.dataService.updateGame(this.database.id, this.selectedGame, '[]').then(
            (results) => {
                this.messages.set([{ severity : 'success', text: 'Sucessfully updated game.'}]);
            },
            (error : string) => {
                this.messages.set([{ severity : 'error', text: 'Failed to update game.'}]);
            }
        );
    }

    public delete() {
        const b = this.dataService.deleteGame(this.database.id, this.selectedGame.id);

        if (b) {
            this.onRowUnselect(null);
            this.getData();
            this.messages.set([{ severity : 'success', text: 'Sucessfully deleted game.'}]);
        } else {
            this.messages.set([{ severity : 'error', text: 'Error deleting game.'}]);
        }
    }

//  PRIVATE METHODS

    private getData() {
        this.dataService.getGames(this.database.id).then(
            (data) => {
                this.games = data;
                this.dataService.setCurrentGames(data);
            },
            (error : string) => {
                console.log(error);
            } 
        );
    }
}
