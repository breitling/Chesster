import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from "@angular/flex-layout";

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { ChessboardComponent } from '../chessboard/chessboard.component';
import { PlayerBoxComponent } from '../playerbox/playerbox.component';

import { Player } from '../Models/Player';
import { ChessNotationTurn, Sides } from '../Models/ChessNotationTurn';
import { DataService } from '../Services/DataService.service';
import { Move } from '../Models/Move';

import { Chess } from 'chess.js';

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [CommonModule,FlexLayoutModule,ChessboardComponent,ButtonModule,PlayerBoxComponent,TableModule,TooltipModule],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {
    public position : string = 'start'; //'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    turns : number = 0;
    halfTurns : number = 0;
    whoseTurn : number = Sides.WHITE;
    orientation : boolean = true;
    showEvalBar : boolean = false;

    playertop : Player;
    playerbottom : Player;

    @ViewChild("board") board : any;
    @ViewChild("analysisarea") analysisarea : ElementRef | undefined;

    bottomcolor : string = 'white';
    topcolor : string = 'black';

    moves : ChessNotationTurn [] = [];

    enginescore : number;
    enginemoves : string | undefined;

    tooltipOptions = {
        tooltipZIndex: "10px",
    }

    constructor(private dataService : DataService) {
        this.playertop = { name: 'Player', rating: 1500, country: 'France'};
        this.playerbottom = { name: 'Hero', rating: 1500, country: 'USA'};
        this.enginemoves = undefined;
        this.enginescore = 0;
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
    }

//  BUTTON CALLBACKS

    public firstMove() {
        this.board.position = 'start';

        this.turns = 0;
        this.halfTurns = 0;
        this.whoseTurn = Sides.WHITE;
    }

    public lastMove() {
        const m = this.moves[this.moves.length-1];

        this.board.position = ((m.blackFen === '') ? m.whiteFen : m.blackFen);

        this.turns = m.turn - ((m.blackFen === '') ? 1 : 0);;
        this.halfTurns = 2 * m.turn - ((m.blackFen === '') ? 1 : 0);
        this.whoseTurn = ((m.blackFen === '') ? Sides.BLACK : Sides.WHITE);
    //  console.log(m.blackFen + ' ' + this.turns + '/' + this.halfTurns);
    }

    public nextMove() {
        const m = this.moves[this.turns];

        if (m !== undefined)
            this.board.position = this.nextFen(this.moves[this.turns]);
    }

    public previousMove() {
        if (this.turns > 0) {
            const m = this.moves[this.turns-1];
            this.board.position = this.previousFen(m);
        }
        else {
            this.firstMove();
        }
    }

    public undoLastMove() {
        this.board.undo();

        if (this.whoseTurn === Sides.WHITE) {
            this.turns--;
            this.halfTurns--;
            this.whoseTurn = 1 - this.whoseTurn;
            
            const m = this.moves[this.turns];
            m.blackMove = '';
            m.blackFen = '';
        } else {
            this.moves.pop();
            this.halfTurns--;
            this.whoseTurn = 1 - this.whoseTurn;
        }
    }

    public isTopTurn() : boolean {
        if (this.topcolor == 'white')
            return this.whoseTurn == 0;
        else
            return this.whoseTurn == 1;
    }

    public isBottomTurn() : boolean {
        if (this.bottomcolor == 'white')
            return this.whoseTurn == 0;
        else
            return this.whoseTurn == 1;
    }

    public flipboard() {
        if (this.orientation) {
            this.orientation = false;
            this.board.orientation = this.orientation;
            this.playertop = { name: 'Hero', rating: 1500, country: 'USA'};
            this.playerbottom = { name: 'Player', rating: 1500, country: 'France'};
            this.bottomcolor = 'black';
            this.topcolor = 'white';
        } else {
            this.orientation = true;
            this.board.orientation = this.orientation;
            this.playertop = { name: 'Player', rating: 1500, country: 'France'};
            this.playerbottom = { name: 'Hero', rating: 1500, country: 'USA'};
            this.bottomcolor = 'white';
            this.topcolor = 'black';
        }
    }

    public restart() {
        this.board.reset();

        this.moves = [];

        this.turns = 0;
        this.halfTurns = 0;
        this.whoseTurn = Sides.WHITE;
        this.enginemoves = undefined;
        this.enginescore = 0;
    }

    public selectMove(m : ChessNotationTurn, side : number) {
        this.board.position = ((side === Sides.WHITE) ? m.whiteFen : m.blackFen);

        this.turns = (side === Sides.WHITE) ? m.turn-1 : m.turn;
        this.halfTurns = 2*this.turns + ((side === Sides.BLACK) ? 1 : 0);
        this.whoseTurn = 1 - side;
    }

    public analysis() {
        const value : any [] = [];
        const fen : string = this.board.position;

        this.dataService.getAnalysis(0, fen).then((move : Move) => {
            const chess = new Chess(fen);
            const number = chess.moveNumber();
            const bestmove = chess.move(move.lan);

            this.enginescore = (bestmove.color === 'w' ? move.strength.score : -move.strength.score);

            value.push(number + (bestmove.color === 'w' ? '. ' : '. ... ') + bestmove.san);

            move.continuation.forEach(m => {
                let n = chess.moveNumber();
                let bm = chess.move(m);

                if (bm.color === 'w')
                    value.push(n + '. ' + bm.san);
                else
                    value.push(bm.san);
            });

            this.enginemoves = value.join(' ');
        });
    }

//  EVENT HANDLERS

    public calcMoveStyle(m : ChessNotationTurn, side : number) {
        if (side === Sides.WHITE && m.turn === this.turns+1 && this.whoseTurn == Sides.BLACK) 
            return 'background-color: lightgrey;';

        if (side === Sides.BLACK && m.turn === this.turns && this.whoseTurn == Sides.WHITE)
            return 'background-color: lightgrey;';

        return 'background-color: white;';
    }

    public handlePositionChange(e : any) {
        if (this.whoseTurn === Sides.WHITE) {
            this.moves[this.moves.length-1].whiteFen = e;
        } else {
            this.moves[this.moves.length-1].blackFen = e;
            this.turns++;
        }

        this.whoseTurn = 1 - this.whoseTurn;
        this.halfTurns++;
    //  console.log(e + ' ' + this.turns + '/' + this.halfTurns);
    }

    public move(e: any) {
        if (this.whoseTurn === Sides.WHITE) {
            this.moves.push({ turn: this.turns+1, whiteMove: e, whiteFen: '', blackMove: '', blackFen: '' });
        } else {
            this.moves[this.moves.length-1].blackMove = e;
        }
    }
    
//  PRIVATE METHODS

    private nextFen(move : ChessNotationTurn) : string {
        let fen : string;

        if (this.whoseTurn === Sides.WHITE) {
            fen = move.whiteFen;
            this.halfTurns++;
            this.whoseTurn = 1 - this.whoseTurn;
        } else {
            fen = move.blackFen;
            if (fen.length > 0) {
                this.halfTurns++;
                this.turns++;
                this.whoseTurn = 1 - this.whoseTurn;
            }
        }
    //  console.log(fen + ' ' + this.turns + '/' + this.halfTurns)
        return fen;
    }

    private previousFen(move : ChessNotationTurn) : string {
        let fen : string;

        if (this.whoseTurn === Sides.WHITE) {
            fen = move.whiteFen;
            this.halfTurns--;
            this.turns--;
            this.whoseTurn = 1 - this.whoseTurn;
        } else {
            fen = move.blackFen;
            this.halfTurns--;
            this.whoseTurn = 1 - this.whoseTurn;
        }
    //  console.log(fen + ' ' + this.turns + '/' + this.halfTurns)
        return fen;
    }
}
