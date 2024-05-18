import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ChessboardComponent } from '../chessboard/chessboard.component';

import { ButtonModule } from 'primeng/button';
import { PlayerBoxComponent } from '../playerbox/playerbox.component';

import { Player } from '../Models/player';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule,FlexLayoutModule,ChessboardComponent, ButtonModule, PlayerBoxComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {
    public position : string = 'start'; //'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    turn : number = 0;
    playertop : Player;
    playerbottom : Player;

    @ViewChild("board") board : any;

    whitealign : string = 'bottom';
    blackalign : string = 'top';

    constructor() {
        this.playertop = { name: 'Player', rating: 1500, country: 'France'};
        this.playerbottom = { name: 'Hero', rating: 1500, country: 'USA'};
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
    }

    public restart() {
        this.board.reset();
    //  console.log(this.board.fen());
        this.turn = 0;
    }

    public handlePositionChange(e : any) {
        this.turn = 1 - this.turn;
        console.log(e);
    }
}
