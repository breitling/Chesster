import { Component, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { Message } from 'primeng/message';

import { DataService } from '../Services/DataService.service';

 interface TimeClass {
    class: string;
    value: string;
}

@Component({
    selector: 'app-user',
    imports: [CommonModule, ButtonModule, TableModule, FormsModule, MessagesModule, InputTextModule, TextareaModule, DropdownModule],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserComponent {
    public database;

    public account : string;

    public year : string;
    public month : string;

    public timeClasses : TimeClass [] | undefined;
    public timeClass : TimeClass | undefined;

    public games! : any [];         // Chess.com objects/games!
    public selectedGames! : any;

    public messages = signal<any []>([]);

    constructor(private dataService : DataService) {
        this.database = this.dataService.getDatabase();

        this.account = '';
        this.year = '2025';
        this.month = '01';

        this.timeClasses = [ 
            { class: 'All', value: 'all'},
            { class: 'Blitz', value: 'blitz'}, 
            { class: 'Bullet', value: 'bullet'},
            { class: 'Rapid', value: 'rapid'}, 
            { class: 'Daily', value: 'daily'}
        ];

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
                    } else if (['agreed','insufficient','timevsinsufficient','repetition','statemate','50move'].includes(g.white.result)) {
                        g.result = "DRAW"
                    } else {
                        g.result = 'BLACK_WINS';
                    }
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

//  PRIVATE METHODS

    private gamesToString(games: any) : string {
        let s = '';

        for (let n = 0; n < games.length; n++) {
            s = s.concat(games[n].white.username).concat(' vs ').concat(games[n].black.username).concat('\n');
        }

        return s;
    }
}
