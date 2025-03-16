import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ContextMenuModule } from 'primeng/contextmenu';

import { Sides } from '../Models/ChessNotationTurn';
import { Game } from '../Models/Game';
import { DataService } from '../Services/DataService.service';

import { Chess } from 'chess.js';
import { FormsModule } from '@angular/forms';
import { Variation } from '../Models/Variation';

@Component({
    selector: 'analysisbox',
    standalone: true,
    imports: [CommonModule,FlexLayoutModule,ButtonModule,FormsModule,SelectModule,MessageModule,ProgressBarModule,ToastModule,TableModule,ContextMenuModule],
    templateUrl: './analysisbox.component.html',
    styleUrl: './analysisbox.component.scss',
    providers: [MessageService]
})
export class AnalysisBoxComponent implements OnInit, OnChanges, OnDestroy {

    @Input() public game : Game;
    @Input() public moves : string;

    @Output() variationEvent = new EventEmitter<Variation>();

    public doingReview = false;
    public progress : number = 0;
  
    public messages = signal<any []>([]);
  
    private reviewSubscriber : any;
  
    public reviewAnalysis : any [] = [];
    public selectedAnalysis : any | undefined;
  
    public analysisItems : MenuItem [] = [
        {label: '+ Promote to Variation', command: (event) => this.makeVariation(event) }
    ];
    
    public depths: any [] = [
        { name: 'Beginner', depth: 10 },
        { name: 'Advanced', depth: 20 },
        { name: 'Master', depth: 30 },
    ];

    public selectedDepth: any = this.depths[1];

    constructor(private messageService: MessageService, private dataService : DataService) {
        this.game = dataService.createGame();
        this.moves = '';
    }

    public ngOnInit() {
        this.reviewSubscriber = this.dataService.gameReviewEmitter.subscribe((msg : string) => {
            this.reviewDone(msg);
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        this.game = this.dataService.cloneGame(this.game);
        this.game.moves = this.moves;
        this.game.variations = [];
    }

    ngOnDestroy() : void {
        this.reviewSubscriber.unsubscribe();
    }

//  METHODS    

    public review() {
        this.reviewAnalysis = [];

        if (this.game.moves.length > 0) {
            if (this.doingReview === false) {
                this.doingReview = true;
                const rc = this.dataService.doGameReview(this.dataService.engineIndex(), this.selectedDepth.depth, this.game, (v : number) => { this.progress = v; })
                
                if (rc.length > 0) {
                    this.messages.set([{ severity : 'error', text: rc}]);
                    this.doingReview = false;
                }
            }
        } else {
            this.messages.set([{ severity : 'error', text: 'No game selected.'}]);
        }
    }

    private reviewDone(msg : string) {
        this.progress = 0;
        this.doingReview = false;
        const data : any [] = this.dataService.getReviewAnalysis();

        data.forEach((a) => {
            try {
                a.moveList = this.notationOf(a);
                a.turn = this.turnOf(a);
                a.score = this.scoreOf(a);
            } catch (e) {
                console.log(e);
            }
        });

        this.reviewAnalysis = data;

        this.messages.set([{ severity : 'success', text: msg}]);
    }

    public abortReview() {
        this.dataService.abortReview().then(
            (message : string) => {
                this.progress = 0;
                this.doingReview = false;
                this.messages.set([{ severity : 'warn', text: message}]);
            },
            (error : string) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

    public turnOf(a : any) : string {
        if (a.color === 'b')
            return a.number;
        else
            return ' ';
    }

    public scoreOf(a : any) : string {
        if (a.bestMove != null) {
            if (a.bestMove.strength.forcedMate)
                return 'M' + a.bestMove.strength.mateIn;

            if (a.color === 'b')
                return '' + (0 - Number(a.bestMove.strength.score));
            else
                return a.bestMove.strength.score;
        } else {
            return '';
        }
    }

    public notationOf(a : any) : string {
        const chess = new Chess(a.fen);
        const values : any [] = [];

        if (a.bestMove != null) {
            const number = chess.moveNumber();
            const bestmove = chess.move(a.bestMove.lan);
            const moves : string [] = a.bestMove.continuation;

            a.color = bestmove.color;

            values.push(number + (bestmove.color === 'w' ? '. ' : '. ... ') + bestmove.san);

            moves.forEach(m => {
                if (m !== '') {
                    try {
                        const n = chess.moveNumber();
                        const bm = chess.move(m);

                        if (bm.color === 'w')
                            values.push(n + '. ' + bm.san);
                        else
                            values.push(bm.san);
                    } catch(e) {
                        console.log(e)
                        values.push('[' + m + ']');
                    }
                }
            });
        } else {
            if (a.fen.includes('b'))
                a.color = 'w';
            else
                a.color = 'b';
        }

        return values.length > 0 ? values.join(' ') : '';
    }

    public makeVariation(event : MenuItemCommandEvent) {
        if (this.selectedAnalysis) {
            const data = this.selectedAnalysis;
            const side = data.move.color === 'w' ? Sides.WHITE : Sides.BLACK;

            let index = data.index;

            if (side === Sides.BLACK)
                index = index-1;

            console.log('Creat variation...');

            const v = this.dataService.createVariation(index);
            v.side = side;
            v.turn = v.index + 1;
            v.fen = data.move.fen;
            v.startingFen = v.fen;
            v.moves = data.move.moveList;

            this.variationEvent.emit(v);
        }    
    }
}
