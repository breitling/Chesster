import { Component, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';

import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { Popover, PopoverModule } from 'primeng/popover';

import { DataService } from '../Services/DataService.service';
import { withRequestsMadeViaParent } from '@angular/common/http';

interface TimeClass {
    class: string;
    value: string;
}

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule,ButtonModule,TableModule,FormsModule,InputTextModule,SelectModule,Message,PopoverModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent {
    public database;

    public account : string;

    public year : string;
    public month : string;

    public timeClasses : TimeClass [];
    public timeClass : TimeClass | undefined;

    public games! : any [];         // Chess.com objects/games!
    public selectedGames! : any;

    public messages = signal<any []>([]);

    @ViewChild('po') popover!: Popover;
    public selectedGame : any | undefined;  // for popover 

    constructor(private dataService : DataService) {
        this.database = this.dataService.getDatabase();

        this.account = '';
        this.year = '2025';
        this.month = String(new Date().getMonth() + 1).padStart(2,'0');

        this.timeClasses = [ 
            { class: 'All', value: 'all'},
            { class: 'Blitz', value: 'blitz'}, 
            { class: 'Bullet', value: 'bullet'},
            { class: 'Rapid', value: 'rapid'}, 
            { class: 'Daily', value: 'daily'}
        ];

        this.games = [];

        this.messages.set([]);
    }

    public getGames() {
        const tc = (this.timeClass !== undefined) ? this.timeClass.value : 'all';

        this.dataService.getGamesFromCDC(this.account, this.year, this.month, tc).then(
            (results) => {
                this.games = JSON.parse(results);

                this.games.forEach((g) => {
                    if (g.white.result == 'win') {
                        g.result = 'WHITE_WINS';
                    } else if (['agreed','insufficient','timevsinsufficient','repetition','stalemate','50move'].includes(g.white.result)) {
                        g.result = "DRAW"
                    } else {
                        g.result = 'BLACK_WINS';
                    }

                    g.time_class = g.time_class.charAt(0).toUpperCase() + g.time_class.substring(1);
                });
            },
            (error : string) => {
              this.messages.set([{ severity : 'error', text: 'Failed to get games from Chess.com'}]);
            }
        );
    }

    public import() {
        const database = this.dataService.getDatabase();

        this.selectedGames.forEach((g : any) => {
            let game = this.dataService.createGame();

            game.white = g.white.username;
            game.whiteELO = g.white.rating;
            game.black = g.black.username;
            game.blackELO = g.black.rating;
            game.result = g.result;

            game.date = '';
            game.site = 'Chess.com';
            game.event = 'Let\'s Play ' + g.rules;

            const pgnparts : string [] = g.pgn.split('\n');
            const index = pgnparts.length-2;

            game.moves = pgnparts[index].replaceAll(/{.*?}/g,'').replaceAll(/[0-9]+\.\.\./g,'').replaceAll(/[ ]+/g,' ');
            game.moveCount = game.moves.split(' ').length / 3;
            // game.eco = pgnparts[9].split(' ')[1].substring(1,4); ECO pgnparts index? not always 9
            
            this.dataService.saveGame(database.id, game, true).then(
                (results) => {
                    this.messages.set([{ severity : 'success', text: 'Sucessfully imported game(s).'}]);
                },
                (error : string) => {
                    this.messages.set([{ severity : 'error', text: error}]);
                }
            );
        });
   
        this.dataService.setCurrentGames([]);
    }

    public displayGame(event : any, game : any) {
        if (this.selectedGame?.uuid === game.uuid) {
            this.popover.hide();
            this.selectedGame = null;
        } else {
            this.selectedGame = game;
            this.popover.show(event);
        }
    }

    public moves(pgn : string) : string {
        const pgnparts : string [] = pgn.split('\n');
        const index = pgnparts.length-2;

        return pgnparts[index].replaceAll(/{.*?}/g,'').replaceAll(/[0-9]+\.\.\./g,'').replaceAll(/[ ]+/g,' ');
    }

    public opening(eco : string) : string {
        if (eco) {
            return eco.substring(eco.lastIndexOf('/')+1, eco.length).replaceAll(/-/g,' ').replace('O O O','O-O-O').replace('O O','O-O');
        } else {
            return '';
        }
    }

//  PRIVATE METHODS

    private gamesToString(games: any) : string {
        let s = '';

        for (let n = 0; n < games.length; n++) {
            s = s.concat(games[n].white.username).concat(' vs ').concat(games[n].black.username).concat('\n');
        }

        return s;
    }
}
