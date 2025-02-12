import { Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { DataService } from '../Services/DataService.service';
import { Database } from '../Models/Database';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Game } from '../Models/Game';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ChessPositionComponent } from "../chessposition/chessposition.component";
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-games',
    imports: [CommonModule, ButtonModule, TableModule, FormsModule, MessagesModule, InputTextModule, TextareaModule, ChessPositionComponent, PanelModule],
    templateUrl: './games.component.html',
    styleUrl: './games.component.scss'
})
export class GamesComponent implements OnInit {

    public activeIndex: number = 1;

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
        this.activeIndex = 0;
        this.dataService.setSelectedGame(this.selectedGame);
        this.dataService.unsetPreload();
    }

    public onRowUnselect(event: any) {
        this.dataService.setSelectedGame(this.selectedGame); //NOTE: this.selectedGame is nothing
        this.chessPositionBoard = this.dataService.getChessPositionBoard();
        this.activeIndex = 1;
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

            this.dataService.log(fen);
            this.dataService.setChessPositionBoard(fen);

            this.dataService.findGames(this.database.id, fen).then(
                (data) => {
                    this.games = data;
                    this.dataService.setCurrentGames(data);
                },
                (error : string) => {
                    this.dataService.log(error);
                }
            );
        }
    }

    public load() {
        this.dataService.setPreload(this.selectedGame);
        this.dataService.log('Setting preload...');
    }

    public start() {
        if (this.board)
            this.board.start();
    }

    public update() {
        this.dataService.updateGame(this.database.id, this.selectedGame).then(
            (results) => {
                this.messages.set([{ severity : 'success', detail: 'Sucessfully updated game.'}]);
            },
            (error : string) => {
                this.messages.set([{ severity : 'error', detail: 'Failed to update game.'}]);
            }
        );
    }

//  PRIVATE METHODS

    private getData() {
        this.dataService.getGames(this.database.id).then(
            (data) => {
                this.games = data;
                this.dataService.setCurrentGames(data);
            },
            (error : string) => {
                this.dataService.log(error);
            } 
        );
    }
}
