import { Component, ViewChild } from '@angular/core';
import { ChessboardComponent } from '../chessboard/chessboard.component';

import { ButtonModule } from 'primeng/button';
import { PlayerBoxComponent } from '../playerbox/playerbox.component';

import { Player } from '../Models/player';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ChessboardComponent, ButtonModule, PlayerBoxComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
    public position : string = 'start'; //'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    playertop : Player;
    playerbottom : Player;

    @ViewChild("board") board : any;

    constructor() {
        this.playertop = { name: 'Player', rating: 1500, country: 'France'};
        this.playerbottom = { name: 'Player', rating: 1500, country: 'USA'};
    }

    public move() {
        this.board.move("e2-e4");
        console.log(this.board.fen());
    }
}
