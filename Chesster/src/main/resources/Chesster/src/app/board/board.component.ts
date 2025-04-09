import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from "@angular/flex-layout";

import { ChessboardComponent } from '../chessboard/chessboard.component';
import { PlayerBoxComponent } from '../playerbox/playerbox.component';

import { Player } from '../Models/Player';
import { ChessNotationTurn, Sides } from '../Models/ChessNotationTurn';
import { DataService } from '../Services/DataService.service';
import { Move } from '../Models/Move';

import { Chess } from 'chess.js';
import { Game } from '../Models/Game';
import { Database } from '../Models/Database';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { FormsModule } from '@angular/forms';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api/menuitem';
import { Variation } from '../Models/Variation';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

import { NoteBoxComponent } from '../notebox/notebox.component';
import { AnalysisBoxComponent } from '../analysisbox/analysisbox.component';
import { UpdateBoxComponent } from '../updatebox/updatebox.component';
import { ChessPositionComponent } from "../chessposition/chessposition.component";

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [CommonModule, FlexLayoutModule, ChessboardComponent, ButtonModule, PlayerBoxComponent, NoteBoxComponent, ProgressBarModule, ToastModule, 
              SelectModule,CheckboxModule,TableModule, TabsModule, TooltipModule, FormsModule, InputTextModule, TextareaModule, ContextMenuModule, 
              MessageModule, AnalysisBoxComponent, UpdateBoxComponent, ChessPositionComponent],
    templateUrl: './board.component.html',
    styleUrl: './board.component.scss',
    providers: [MessageService]
})
export class BoardComponent implements OnInit, AfterViewInit {
    public position : string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    fen : string = '';
    turns : number = 0;
    halfTurns : number = 0;
    moveOffset : number = 0;
    whoseTurn : number = Sides.WHITE;
    orientation : boolean = true;
    showEvalBar : boolean = false;

    playertop : Player;
    playerbottom : Player;

    @ViewChild('board') board : any;
    @ViewChild('setupBoard') setupBoard : any;
    @ViewChild('movecm') moveCM : ContextMenu | undefined;
    @ViewChild('analysiscm') analysisCM : ContextMenu | undefined;
    @ViewChild('analysisarea') analysisarea : ElementRef | undefined;
    @ViewChild('tabs') tabs : ElementRef | undefined;

    bottomcolor : string = 'white';
    topcolor : string = 'black';

    moves : ChessNotationTurn [] = [];

//  VARIATION STUFF
    noVariation : number = -1;
    currentVariation : number = this.noVariation;

    selectedMove : any | undefined;
    selectedVariation : any | undefined;

//  CHESS ENGINE STUFF
    engineName : string;
    enginescore : number;
    enginemoves : string | undefined;
    mate : string;

    public database : Database;
    public game : Game;

    tooltipOptions = {
        tooltipZIndex: "10px",
    }

    public gameItems: MenuItem []  = [
        {label: '! - Good Move', command: (event) => this.addNotation(event, '!') },
        {label: '? - Bad Move', command: (event) => this.addNotation(event, '?') },
        {label: '!! - Very Good Move', command: (event) => this.addNotation(event, '!!') },
        {label: '?? - Blunder', command: (event) => this.addNotation(event, '??') },
        {label: '!? - Speculative Move', command: (event) => this.addNotation(event, '!?') },
        {label: '?! - Dubious Move', command: (event) => this.addNotation(event, '?!') },
        {label: '- Remove Symbol', command: (event) => this.removeNotation(event) },
        {label: '+ Variation', command: (event) => this.addVariation(event) }
    ];

    public variationItems : MenuItem [] = [
        {label: '+ Dump Variation', command: (event) => this.dumpVariation(event)},
        {label: '+ Reset Variation', command: (event) => this.resetVariation(event) },
        {label: '- Delete Variation', command: (event) => this.deleteVariation(event) }
    ];

    public saveOrUpdate : string = 'Save';
    public showVariations : boolean = false;
    public variationToggleText : string = 'Show Variations';
    public loadingmoves : boolean = false;
    public setup : boolean = false;
    public setupBoardFen : string = '';
    public setupMove : number = 1;
    public setupSide : string = 'White';
    public setupWhiteCastling : string = '';
    public setupBlackCastling : string = '';
    public tabindex : number = 0;

    public messages = signal<any []>([]);

    constructor(private messageService: MessageService, private dataService : DataService) {
        this.playertop = { name: 'Player', rating: 1500, country: 'USA'};
        this.playerbottom = { name: 'Hero', rating: 1500, country: 'USA'};

        this.enginemoves = undefined;
        this.enginescore = 0;
        this.mate = '';

        this.game = dataService.getPreloadedGame();
        this.database = dataService.getDatabase();
        this.engineName = this.dataService.engines()[1].name;
    //  console.log('B1`:' + this.game.id);
    }

    ngOnInit() {
        this.tabindex = 0;
    }

    ngAfterViewInit() {
        console.log('Checking for preloaded game...');

        if (this.dataService.doPreload()) {
            console.log('Doing preload...');
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
        if ((this.turns - this.moveOffset) < this.moves.length) {
            const m = this.moves[this.turns - this.moveOffset];
            this.board.position = this.nextFen(m);
        }
    }

    public previousMove() {
        if ((this.turns - this.moveOffset) > 0) {
            const m = this.moves[this.turns - this.moveOffset - 1];
            this.board.position = this.previousFen(m);
        } else {
            this.firstMove();
        }
    }

    public undoLastMove() {
        this.board.undo();

        if (this.currentVariation === this.noVariation) {
            if (this.whoseTurn === Sides.WHITE) {
                this.turns--;
                this.halfTurns--;
                this.whoseTurn = 1 - this.whoseTurn;
                
                const m = this.moves[this.turns - this.moveOffset];
                m.blackMove = '';
                m.blackFen = '';
            } else {
                this.moves.pop();
                this.halfTurns--;
                this.whoseTurn = 1 - this.whoseTurn;
            }

            this.board.position = this.currentFen();
        } else {
            const v = this.game.variations[this.currentVariation];
            const n = v.moves.lastIndexOf(' ');

            v.moves = v.moves.substring(0, n);

            if (v.side === Sides.WHITE)
                v.turn--;

            v.side = 1 - v.side;
            v.moveCount--;
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
        this.game = this.dataService.createGame();

        this.board.position = 'start';
        this.board.reset();

        this.moves = [];

        this.turns = 0;
        this.halfTurns = 0;
        this.whoseTurn = Sides.WHITE;
        this.enginemoves = undefined;
        this.enginescore = 0;
        this.moveOffset = 0;

        this.showVariations = false;
        this.variationToggleText = 'Show Variations';
        this.currentVariation = this.noVariation;
        this.saveOrUpdate = 'Save';
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

        console.log(fen);

        this.dataService.getAnalysis(this.dataService.engineIndex(), fen).then(
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
                console.log(error);
                this.enginemoves = error;
            }
        );
    }

    public save() {
        this.tabindex = 2;
        this.saveOrUpdate = 'Save';

        if (this.game.id != '') 
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

//  SETUP POSITION CALLBACKS

    public setupPosition() {
        this.fen = '';
        this.setupMove = 1;
        this.setupSide = 'White';
        this.setup = true;
        this.setupWhiteCastling = this.setupBlackCastling = '';
        this.showVariations = false;
        this.variationToggleText = 'Show Variations';
        this.loadingmoves = false;
    }

    public startSetupBoard() {
        this.setupBoard.start();
    }

    public clearSetupBoard() {
        this.setupBoard.clear();
    }

    public setupFenChanged() {
        this.setupBoard.position = this.fen;
        console.log("Got Here");
    }

    public useSetupBoard() {
        this.moves = [];
        this.whoseTurn = this.setupSide === 'White' ? Sides.WHITE : Sides.BLACK;
        this.turns = this.setupMove - 1;
        this.moveOffset = this.setupMove - 1;
        this.halfTurns = 2 * this.turns + (this.whoseTurn === Sides.BLACK ? 1 : 0);

        let fen = this.setupBoard.fen();
        let castling = this.setupWhiteCastling + this.setupBlackCastling.toLowerCase();
        fen = fen + ' ' + this.setupSide.charAt(0).toLowerCase() + ' ' + (castling === '' ? '-' : castling) + ' - 0 ' + (this.turns+1);
        this.board.setChess(fen);
        this.board.position = fen;

        if (this.whoseTurn === Sides.BLACK)
            this.moves.push({ turn: this.turns+1, whiteMove: '...', whiteFen: '', blackMove: '', blackFen: '' });

        this.setup = false;

        console.log('Done');
    }

//  LOAD MOVE CALLBACKS

    public load() {
        this.loadingmoves = true;
        this.setup = false;
        this.showVariations = false;
        this.variationToggleText = 'Show Variations';
    }

    public loadMoves() {
        this.preloadGame(this.game);
        this.loadingmoves = false;
    }

    public cancel() {
        this.loadingmoves = false;
        this.setup = false;
    }

//  VARIATION CALLBACKS

    public variationToggle() {
        if (this.showVariations) {
            this.showVariations = false;
            this.variationToggleText = 'Show Variations';
        } else  {
            this.showVariations = true;
            this.variationToggleText = 'Hide Variations';
            this.setup = false;
            this.loadingmoves = false;
        }
    }

    public makeVariation(v: Variation) {
        let index = v.index;

        if (this.game.variations[index].index === 0) {
            this.game.variations[index] = v;
            this.currentVariation = v.index;

            const f = this.board.startVariation(v.fen);
            this.board.position = f;
            this.tabindex = 0;
            this.showVariations = true;
            this.variationToggleText = 'Hide Variations';
        } else {
            this.messages.set([{ severity : 'warn', text: 'Variation already exists'}]);
        }
    }

    public deleteVariation(event : MenuItemCommandEvent) {
        if (this.selectedVariation) {
            const data = this.selectedVariation;
            const index = data.index;

            console.log('D: ' + index + '/' + this.moveOffset);

            if (this.game.variations[index].index !== 0) {
                this.game.variations[index] = this.dataService.createVariation(0);
            } else {
                console.log('Failed to delete variation at ' + index);
            }
        }
        
        let count = 0;

        for (var n = 0; n < this.game.variations.length; n++)
            if (this.game.variations[n].index === 0)
                count++;

        if (count === this.game.variations.length) {
            this.showVariations = false;
            this.variationToggleText = 'Show Variations';
        }
    }

    public newVariation() {
        const index = Number(this.enginemoves?.substring(0, this.enginemoves.indexOf('.'))) - this.moveOffset - 1;
        const side = this.enginemoves?.includes('. ...') ? Sides.BLACK : Sides.WHITE;

        console.log('' + index + '/' + this.moveOffset);

        if (this.game.variations[index].index === 0 && this.enginemoves) {
            console.log('Creat variation...');

            const v = this.dataService.createVariation(index);
            v.side = side;
            v.turn = v.index + this.moveOffset + 1;
            v.fen = side === Sides.WHITE ? this.moves[index-1].blackFen : this.moves[index].whiteFen;
            v.startingFen = v.fen;
            v.moves = this.enginemoves;

            this.game.variations[index] = v;
            this.currentVariation = v.index;
            this.showVariations = true;
            this.variationToggleText = 'Hide Variations';

            const f = this.board.startVariation(v.fen);
            this.board.position = f;
            this.tabindex = 0;
        } else {
            this.messages.set([{ severity : 'warn', text: 'Variation already exists'}]);
        }
    }

    public dumpVariation(event : MenuItemCommandEvent) {
        if (this.selectedVariation) {
            const data = this.selectedVariation;
            const v = this.game.variations[data.index];
            this.dump(v);
        }
    }

    private dump(v: Variation) {
        console.log('V: ' + v.fen + '/' + v.index + ' = ' + v.turn + ' ' 
                          + v.moves + (v.side === Sides.WHITE ? ' White to move' : ' Black to move'));
    }

    public resetVariation(event : MenuItemCommandEvent) {
        if (this.selectedVariation) {
            const data = this.selectedVariation;
            const index = data.index - this.moveOffset;

            if (this.game.variations[index].index !== 0) {
                const v = this.game.variations[index];

                v.moveCount = 0;
                v.fen = v.startingFen;
                v.turn = data.index + 1;
                v.side = v.moves.includes('. ...') ? Sides.BLACK : Sides.WHITE;
                this.board.selectVariation(v.fen);
                this.board.position = v.fen;

                this.game.variations[index] = v;
            }
        }
    }

//  EVENT HANDLERS

    public calcMoveStyle(m : ChessNotationTurn, side : number) {
        if (this.currentVariation == this.noVariation) {
            if (side === Sides.WHITE && m.turn === this.turns+1 && this.whoseTurn == Sides.BLACK) 
                return 'background-color: lightgrey;';

            if (side === Sides.BLACK && m.turn === this.turns && this.whoseTurn == Sides.WHITE)
                return 'background-color: lightgrey;';
        } 

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
            // in a variation????
        }
    }

    public move(e: any) {
        if (this.currentVariation === this.noVariation) {
            if (this.whoseTurn === Sides.WHITE) {
                this.moves.push({ turn: this.turns+1, whiteMove: e, whiteFen: '', blackMove: '', blackFen: '' });
                this.game.variations.push(this.dataService.createVariation(0));
            } else {
                this.moves[this.moves.length-1].blackMove = e;
            }
        } else {
            const v = this.game.variations[this.currentVariation];

            if (v.side === Sides.WHITE) {              
                v.turn++;
                if (v.moves.endsWith('. ') === false)
                    v.moves = v.moves + ' ' + (v.turn + this.moveOffset) + '.';
            }

            v.moves = v.moves + ' ' + e;
            v.side = 1 - v.side;
            v.moveCount++;

            v.fen = this.board.fen();
        }
    }

    public preloadGame(g : Game) {
        console.log(g.moves);

        const vs = this.game.variations;
        this.game.variations = [];

        if (this.moves.length === 0) {
            console.log('Starting preload...');
            this.board.reset();
            const moves = g.moves.trim();
            const notation = moves.split(' ');
        //  const chess = new Chess();

            let turn = 1;

            console.log('Doing moves...');

            if (moves.startsWith('1. ')) {
                for (var i = 0; i < notation.length-1; i = i+3) {
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

                    this.moves.push({ turn: turn++, whiteMove: w, whiteFen: wfen, blackMove: b, blackFen: bfen });
                    this.game.variations.push(this.dataService.createVariation(0));

                //  console.log(w + ',' + b);
                }
            } else {
                for (var i = 0; i < notation.length-1; i = i+2) {
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

                    this.moves.push({ turn: turn++, whiteMove: w, whiteFen: wfen, blackMove: b, blackFen: bfen });
                    this.game.variations.push(this.dataService.createVariation(0));

                //  console.log(w + ',' + b);
                }
            }

            console.log('Doing variations...');

            if (vs && vs.length > 0) {
                vs.forEach(v => {
                    const vary = this.dataService.createVariation(v.index);

                    vary.moveCount = 0;
                    vary.fen = v.fen;
                    vary.startingFen = v.fen;
                    vary.moves = v.moves.replaceAll("  "," ");  // hack to cure an issue with extra spaces in variation move text
                    vary.turn = vary.index + 1;
                    vary.side = (vary.moves.indexOf('...') > 0) ? Sides.BLACK : Sides.WHITE;

                    this.game.variations[v.index] = vary;
                    const f = this.board.startVariation(v.fen);

                    this.showVariations = true;
                    this.variationToggleText = 'Hide Variations';
                });
            }
            
            console.log('Done.');

            this.messages.set([{ severity : 'success', text: 'Done preloading game.'}]);
        } else {
            this.messages.set([{ severity : 'success', text: 'Game already loaded.'}]);
        }
    }

    public changeTab(n: number) {
    //  console.log('change to tab ' + n);
        this.tabindex = n;
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

    public currentFen() : string {
        if (this.currentVariation === this.noVariation) {
            if (this.moves.length === 0)
                return this.position;

            if (this.whoseTurn === Sides.WHITE)
                return this.moves[this.turns - this.moveOffset - 1].blackFen;
            else
                return this.moves[this.turns - this.moveOffset].whiteFen;
        } else {
            return this.board.fen();
        }
    }

    public getMoves(moves : ChessNotationTurn []) : string {
        let r = '';
        let m = this.moveOffset;

        for (var n = 0; n < moves.length; n++) {
            r = r.concat('' + m + '. ' + moves[n].whiteMove + ' ' + moves[n].blackMove + ' ');
            m++;
        }

        return r;
    }

    private addResults(g : Game) : string {
        if (g.result) {
            if (g.result === 'WHITE_WINS')
                return '1-0'
            else if (g.result === 'DRAW')
                return '1/2-1/2';
            else if (g.result === 'NORESULT')
                return '*';
            else
                return '0-1';
        }

        return '';
    }

    public getFen() : string {
        if (this.moves.length > 0)
            return this.board.position;
        else
            return this.position;
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

                ['!!','??','!?','?!','!','?'].every((n) => {
                    if (move.endsWith(n)) {
                        this.moves[data.index].whiteMove = move.replaceAll(n,'');
                        return false;
                    }
                    return true;
                });
            } else {
                const move = this.moves[data.index].blackMove;

                ['!!','??','!?','?!','!','?'].every((n) => {
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
        this.variationToggleText = 'Hide Variations';

        if (this.selectedMove) {
            const data  = this.selectedMove;
            const index = data.index - this.moveOffset;

            console.log('A: ' + index + '/' + this.moveOffset);

            if (this.game.variations[index].index === 0) {
                const v = this.dataService.createVariation(index);

                v.turn = v.index + 1;
                v.moves = '' + (v.turn + this.moveOffset) + '. ';

                if (data.color === Sides.BLACK) {
                    v.moves = v.moves + '... ';
                    v.fen = this.moves[index].whiteFen;
                    v.side = Sides.BLACK;
                } else {
                    v.fen = this.moves[index-1].blackFen;
                    v.side = Sides.WHITE;
                }

                v.startingFen = v.fen;

                this.game.variations[index] = v;
                this.currentVariation = v.index;

                const f = this.board.startVariation(v.fen);
                this.board.position = f;
            }
        }
    }

    public variationVisible(v : Variation) {
        if (v.index === 0)
            return 'visibility: hidden;';   // background-color: white;' 
        else
            return 'visibility: visible;';  // background-color: lightgrey';
    }
;
    public selectVariation(v: Variation) {
        this.currentVariation = v.index;
        this.board.position = this.board.selectVariation(v);

        const moves = v.moves.split(' ');
        let index = Math.floor(v.moveCount/2) + v.moveCount + 1;

        if (index < moves.length) {
            if (index === 1) {
                v.turn = Number(moves[0]);

                if (moves[index] === '...') {
                    index++;
                    v.moveCount++;
                }
            }

            const m = moves[index];

            this.board.move(m);
            v.fen = this.board.fen();
            v.side = 1 - v.side;

            if (/\d+./.test(moves[index-2]))
                v.turn++;
            
            v.moveCount++;
        }
    }
}
