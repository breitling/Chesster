import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { Game } from '../Models/Game';
import { Database } from '../Models/Database';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api/menuitem';
import { Variation } from '../Models/Variation';
import { TabViewModule } from 'primeng/tabview';

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [CommonModule,FlexLayoutModule,ChessboardComponent,ButtonModule,PlayerBoxComponent,TableModule,TabViewModule,TooltipModule,FormsModule,
                    InputTextModule,TextareaModule,ContextMenuModule],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, AfterViewInit {
    public position : string = 'start'; //'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    fen : string = 'X';
    turns : number = 0;
    halfTurns : number = 0;
    whoseTurn : number = Sides.WHITE;
    orientation : boolean = true;
    showEvalBar : boolean = false;

    playertop : Player;
    playerbottom : Player;

    @ViewChild("board") board : any;
    @ViewChild("analysisarea") analysisarea : ElementRef | undefined;
    @ViewChild('movecm') moveCM : ContextMenu | undefined;

    bottomcolor : string = 'white';
    topcolor : string = 'black';

    moves : ChessNotationTurn [] = [];

//  VARIATION STUFF
    noVariation : number = -1;
    variations : Variation [] = [];
    currentVariation : number = this.noVariation;

    selectedMove : any | undefined;

//  CHESS ENGINE STUFF
    enginescore : number;
    enginemoves : string | undefined;
    mate : string;

    public database : Database;
    public game : Game | undefined;
    public saveOrUpdate : string = 'Save';

    tooltipOptions = {
        tooltipZIndex: "10px",
    }

    public items: MenuItem []  = [
        {label: '! - Good Move', command: (event) => this.addNotation(event, '!') },
        {label: '? - Bad Move', command: (event) => this.addNotation(event, '?') },
        {label: '!! - Very Good Move', command: (event) => this.addNotation(event, '!!') },
        {label: '?? - Blunder', command: (event) => this.addNotation(event, '??') },
        {label: '!? - Speculative Move', command: (event) => this.addNotation(event, '!?') },
        {label: '?! - Dubious Move', command: (event) => this.addNotation(event, '?!') },
        {label: '- Remove Symbol', command: (event) => this.removeNotation(event) },
        {label: '+ Variation', command: (event) => this.addVariation(event) }
    ];

    public doingSave : boolean = false;
    public showVariations : boolean = false;
    public activeIndex : number = 0;

    constructor(private dataService : DataService) {
        this.playertop = { name: 'Player', rating: 1500, country: 'USA'};
        this.playerbottom = { name: 'Hero', rating: 1500, country: 'USA'};
        this.enginemoves = undefined;
        this.enginescore = 0;
        this.mate = '';
        this.game = undefined;

        this.database = dataService.getDatabase();
    }

    ngOnInit() {
        this.dataService.log('Board initializing...');
    }

    ngAfterViewInit() {
        this.dataService.log('Checking for preloaded game...');

        if (this.dataService.doPreload()) {
            this.dataService.log('Doing preload...');
            this.game = this.dataService.getPreloadedGame();

            this.playertop.name = this.game.black;
            this.playertop.rating = Number(this.game.blackELO);
            this.playerbottom.name = this.game.white;
            this.playerbottom.rating = Number(this.game.whiteELO);
            this.preloadGame(this.game);
        }
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

        this.turns = m.turn - ((m.blackFen === '') ? 1 : 0);
        this.halfTurns = 2 * m.turn - ((m.blackFen === '') ? 1 : 0);
        this.whoseTurn = ((m.blackFen === '') ? Sides.BLACK : Sides.WHITE);
    }

    public nextMove() {
        if (this.turns < this.moves.length) {
            const m = this.moves[this.turns];
            this.board.position = this.nextFen(m);
        }
    }

    public previousMove() {
        if (this.turns > 0) {
            const m = this.moves[this.turns-1];
            this.board.position = this.previousFen(m);
        } else {
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

        this.board.position = this.currentFen();
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
        const t = this.playertop;
        const b = this.playerbottom;

        if (this.orientation) {
            this.orientation = false;
            this.board.orientation = this.orientation;
            this.playertop = b;
            this.playerbottom = t;
            this.bottomcolor = 'black';
            this.topcolor = 'white';
        } else {
            this.orientation = true;
            this.board.orientation = this.orientation;
            this.playertop = b;
            this.playerbottom = t;
            this.bottomcolor = 'white';
            this.topcolor = 'black';
        }
    }

    public restart() {
        this.board.position = 'start';
        this.board.reset();

        this.moves = [];

        this.turns = 0;
        this.halfTurns = 0;
        this.whoseTurn = Sides.WHITE;
        this.enginemoves = undefined;
        this.enginescore = 0;

        this.showVariations = false;
        this.variations = [];
        this.currentVariation = this.noVariation;
    }

    public selectMove(m : ChessNotationTurn, side : number) {
        this.board.position = ((side === Sides.WHITE) ? m.whiteFen : m.blackFen);

        this.turns = (side === Sides.WHITE) ? m.turn-1 : m.turn;
        this.halfTurns = 2 * this.turns + ((side === Sides.BLACK) ? 1 : 0);
        this.whoseTurn = 1 - side;

        if (this.currentVariation != this.noVariation) {
            this.currentVariation = this.noVariation;
            this.board.selectGame();
        }
    }

    public analysis() {
        this.mate = '';
        this.enginemoves = '';
        this.enginescore = 0;

        const fen = this.currentFen();

        this.dataService.getAnalysis(1, fen).then(
            (move : Move) => {
                const chess = new Chess(fen);
                const number = chess.moveNumber();
                const bestmove = chess.move(move.lan);
                const values : any [] = [];

                if (move.strength.forcedMate)
                    this.mate = 'Mate in ' + move.strength.mateIn;
                else
                    this.enginescore = (bestmove.color === 'w' ? Number(move.strength.score) : 0 - Number(move.strength.score));

                values.push(number + (bestmove.color === 'w' ? '. ' : '. ... ') + bestmove.san);

                move.continuation.forEach(m => {
                    if (m !== '') {
                        let n = chess.moveNumber();
                        let bm = chess.move(m);

                        if (bm.color === 'w')
                            values.push(n + '. ' + bm.san);
                        else
                            values.push(bm.san);
                    }
                });

                this.enginemoves = values.length > 1 ? values.join(' ') : values[0];
            },
            (error : string) => {
                this.dataService.log(error);
                this.enginemoves = error;
            }
        );
    }

    public save() {
        this.doingSave = true;
        this.activeIndex = 2;

        if (this.game === undefined) 
            this.game = this.dataService.createGame();
        else
            this.saveOrUpdate = 'Update';

        if (this.topcolor === 'white') {
            this.game.white = this.playertop.name;
            this.game.whiteELO = this.playertop.rating.toString();
            this.game.black = this.playerbottom.name;
            this.game.blackELO = this.playerbottom.rating.toString();
        } else {
            this.game.white = this.playerbottom.name;
            this.game.whiteELO = this.playerbottom.rating.toString();
            this.game.black = this.playertop.name;
            this.game.blackELO = this.playertop.rating.toString();
        }

        this.game.moveCount = this.moves.length;
        this.game.moves = this.getMoves(this.moves) + this.addResults(this.game);
    }

    public saveGame() {
        if (this.game !== undefined)
            this.dataService.saveGame(this.database.id, this.game, true);
        this.doingSave = false;
    }

    public updateGame() {
        if (this.game !== undefined)
            this.dataService.updateGame(this.database.id, this.game);
        this.doingSave = false;
    }

    public cancel() {
        if (this.game?.id.length === 0)
            this.game = undefined;
        this.doingSave = false;
        this.activeIndex = 0;
    }

    public load() {
        if (this.game)
            this.preloadGame(this.game);
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
        if (this.currentVariation === this.noVariation) {
            if (this.whoseTurn === Sides.WHITE) {
                this.moves[this.moves.length-1].whiteFen = e;
            } else {
                this.moves[this.moves.length-1].blackFen = e;
                this.turns++;
            }

            this.whoseTurn = 1 - this.whoseTurn;
            this.halfTurns++;
        } else {

        }
    }

    public move(e: any) {
        if (this.currentVariation === this.noVariation) {
            if (this.whoseTurn === Sides.WHITE) {
                this.moves.push({ turn: this.turns+1, whiteMove: e, whiteFen: '', blackMove: '', blackFen: '' });
                this.variations.push(this.dataService.createVariation(0));
            } else {
                this.moves[this.moves.length-1].blackMove = e;
            }
        } else {
            const v = this.variations[this.currentVariation];

            if (v.value.endsWith('. ') === false && v.side === Sides.WHITE)
                v.value = v.value + ' ' + (v.turn) + '. ';

            v.value = v.value + ' ' + e;

            if (v.side === Sides.BLACK)
                v.turn++;

            v.side = 1 - v.side;
            v.fen = this.board.fen();
        }
    }

    public onContextMenu(e : any) {
    }

//  PRIVATE METHODS

    private preloadGame(g : Game) {
        this.dataService.log('Next...');

        this.restart();

        const moves = g.moves.trim();
        const notation = moves.split(' ');
        var i;

        let turn = 1;

        this.dataService.log(moves);

        if (moves.startsWith('1. ')) {
            for (i = 0; i < notation.length; i = i+3) {
                const w = notation[i+1];
                this.board.move(w);
                const wfen = this.board.fen();

                let bfen = '';
                let b = notation[i+2];

                if (b && b.charAt(0) != '1' && b.charAt(0) != '0' && b.charAt(0) != '*') {
                    this.board.move(b);
                    bfen = this.board.fen();
                } else {
                    b = '';
                }

                this.moves.push({ turn: turn, whiteMove: w, whiteFen: wfen, blackMove: b, blackFen: bfen });
                this.variations.push(this.dataService.createVariation(0));
                turn++;
            }
        } else {
            for (i = 0; i < notation.length; i = i+2) {
                const parts = notation[i].split('.');

                const w = parts[1];
                this.board.move(w);
                const wfen = this.board.fen();

                let bfen = '';
                let b = notation[i+1];

                if (b && b.charAt(0) != '1' && b.charAt(0) != '0' && b.charAt(0) != '*') {
                    this.board.move(b);
                    bfen = this.board.fen();
                } else {
                    b = '';
                }

                this.moves.push({ turn: turn, whiteMove: w, whiteFen: wfen, blackMove: b, blackFen: bfen });
                this.variations.push(this.dataService.createVariation(0));
                turn++;
            }
        }

        this.dataService.log('Next...');

        this.turns = 0;
        this.halfTurns = 0;
        this.whoseTurn = Sides.WHITE;

        this.dataService.log('Done.');
    }
    
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

        return fen;
    }

    private currentFen() : string {
        if (this.currentVariation === this.noVariation) {
            if (this.whoseTurn === Sides.WHITE)
                return this.moves[this.turns-1].blackFen;
            else
                return this.moves[this.turns].whiteFen;
        } else {
            return this.board.fen();
        }
    }

    public getMoves(moves : ChessNotationTurn []) : string {
        let r = '';
        let n = 0;

        for (n = 0; n < moves.length; n++) {
            r = r.concat((n+1) + '. ' + moves[n].whiteMove + ' ' + moves[n].blackMove + ' ');
        }

        return r;
    }

    private addResults(g : Game) : string {
        if (g.result) {
            if (g.result === 'WHITE_WINS')
                return '1-0'
            else if (g.result === 'DRAW')
                return '1/2-1/2';
            else
                return '0-1';
        }

        return '';
    }

//  CONTEXT MENU STUFF

    private addNotation(event: MenuItemCommandEvent, notation : string) {
        if (this.selectedMove) {
            const data  = this.selectedMove;

            if (data.color === Sides.WHITE)
                this.moves[data.index].whiteMove = this.moves[data.index].whiteMove + notation;
            else
                this.moves[data.index].blackMove = this.moves[data.index].blackMove + notation;
        }
    }

    private removeNotation(event: MenuItemCommandEvent) {
        if (this.selectedMove) {
            const data  = this.selectedMove;

            if (data.color === Sides.WHITE) {
                const move = this.moves[data.index].whiteMove;

                ['!','?','!!','??','!?','?!'].every((n) => {
                    if (move.endsWith(n)) {
                        this.moves[data.index].whiteMove = move.replaceAll(n,'');
                        return false;
                    }
                    return true;
                });
            } else {
                const move = this.moves[data.index].blackMove;

                ['!','?','!!','??','!?','?!'].every((n) => {
                    if (move.endsWith(n)) {
                        this.moves[data.index].blackMove = move.replaceAll(n,'');
                        return false;
                    }
                    return true;
                });
            }
        }
    }

    public addVariation(event : MenuItemCommandEvent) {
        this.showVariations = true;

        if (this.selectedMove) {
            const data  = this.selectedMove;
            if (this.variations[data.index].index === 0) {
                const v = this.dataService.createVariation(data.index);

                v.turn = v.index + 1;
                v.value = '' + (v.turn) + '. ';

                if (data.color === Sides.BLACK) {
                    v.value = v.value + '... ';
                    v.fen = this.moves[data.index].whiteFen;
                    v.side = Sides.BLACK;
                } else {
                    v.fen = this.moves[data.index-1].blackFen;
                    v.side = Sides.WHITE;
                }

                this.variations[data.index] = v;
                this.currentVariation = v.index;

                const f = this.board.startVariation(v.fen);
                this.board.position = f;
            }
        }
    }

    public variationVisible(v : Variation) {
        if (v.index === 0)
            return 'visibility: hidden;'
        else
            return 'visibility: visible;';
    }

    public selectVariation(v: Variation) {
        this.currentVariation = v.index;
        this.board.position = this.board.selectVariation(v);
    }
}
