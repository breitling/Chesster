import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

declare var $: any;
declare var ChessBoard: any;

import { Chess } from 'chess.js';

@Component({
    selector: 'ng2-chessboard',
    standalone: true,
    imports: [],
    templateUrl: './chessboard.component.html',
    styleUrl: './chessboard.component.scss'
})
export class ChessboardComponent {

    board: any;
    game: Chess;

    private _position:      any     = 'start';
    private _orientation:   Boolean = true;
    private _showNotation:  Boolean = true;
    private _draggable:     Boolean = false;
    private _dropOffBoard:  string  = 'snapback';
    private _pieceTheme:    any     = 'assets/img/defaults/{piece}.png';
    private _moveSpeed:     any     = 200;
    private _snapbackSpeed: any     = 500;
    private _snapSpeed:     any     = 100;
    private _sparePieces:   Boolean = false;

    @Input() animation: Boolean = true;
    @Output() animationChange: EventEmitter<Boolean> = new EventEmitter<Boolean>();

    constructor() {
        this.game = new Chess();
    }

    ngOnInit() {
        this.load();
    }

  // PARAMETERS

    @HostListener('window:resize', ['$event'])
    onResize(event: Event){
        if (this.board) this.board.resize(event);
    }

    @Input()
    set position(value: any) {
        this._position = value;
        if (this.board) this.board.position(value, this.animation);
    //  console.log(value);
    }

    @Input()
    set orientation(value: Boolean) {
        this._orientation = value;
        if(this.board) this.board.orientation(value ? 'white' : 'black');
        this.orientationChange.emit(this._orientation);
    }

    @Input()
    set showNotation(value: Boolean) {
        this._showNotation = value;
        if(this.board) this.load();
        this.showNotationChange.emit(this._showNotation);
    }

    @Input()
    set draggable(value: Boolean) {
        this._draggable = value;
        if(this.board) this.load();
        this.draggableChange.emit(this._draggable);
    }

    @Input()
    set dropOffBoard(value: string) {
        this._dropOffBoard = value;
        if(this.board) this.load();
        this.dropOffBoardChange.emit(this._dropOffBoard);
    }

    @Input()
    set pieceTheme(value: any) {
        this._pieceTheme = value instanceof Function ? value() : value;
        if(this.board) this.load();
        this.pieceThemeChange.emit(this._pieceTheme);
    }

    @Input()
    set moveSpeed(value: any) {
        this._moveSpeed = value;
        if(this.board) this.load();
        this.moveSpeedChange.emit(this._moveSpeed);
    }

    @Input()
    set snapbackSpeed(value: any) {
        this._snapbackSpeed = value;
        if(this.board) this.load();
        this.snapbackSpeedChange.emit(this._snapbackSpeed);
    }

    @Input()
    set snapSpeed(value: any) {
        this._snapSpeed = value;
        if(this.board) this.load();
        this.snapSpeedChange.emit(this._snapSpeed);
    }

    @Input()
    set sparePieces(value: Boolean) {
        this._sparePieces = value;
        if(this.board) this.load();
        this.sparePiecesChange.emit(this._sparePieces);
    }

    get position():      any     { return this._position;      }
    get orientation():   Boolean { return this._orientation;   }
    get showNotation():  Boolean { return this._showNotation;  }
    get draggable():     Boolean { return this._draggable;     }
    get dropOffBoard():  string  { return this._dropOffBoard;  }
    get pieceTheme():    any     { return this._pieceTheme;    }
    get moveSpeed():     any     { return this._moveSpeed;     }
    get snapbackSpeed(): any     { return this._snapbackSpeed; }
    get snapSpeed():     any     { return this._snapSpeed;     }
    get sparePieces():   Boolean { return this._sparePieces;   }

    @Output() lastMove:            EventEmitter<string>  = new EventEmitter<string>();
    @Output() positionChange:      EventEmitter<any>     = new EventEmitter<any>();
    @Output() orientationChange:   EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() showNotationChange:  EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() draggableChange:     EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() dropOffBoardChange:  EventEmitter<string>  = new EventEmitter<string>();
    @Output() pieceThemeChange:    EventEmitter<any>     = new EventEmitter<any>();
    @Output() moveSpeedChange:     EventEmitter<any>     = new EventEmitter<any>();
    @Output() snapbackSpeedChange: EventEmitter<any>     = new EventEmitter<any>();
    @Output() snapSpeedChange:     EventEmitter<any>     = new EventEmitter<any>();
    @Output() sparePiecesChange:   EventEmitter<Boolean> = new EventEmitter<Boolean>();

  // METHODS

    public clear() {
        this.board.clear(this.animation);
    }

    public move(notation: string) {
        this.board.move(notation);
    }

    public fen() {
        return this.game.fen();
    }

    public reset() {
        this.game.reset();
        this.position = 'start'; // this.game.fen();
    }

    public undo() {
        this.game.undo();
        this.position = this.game.fen();
    }

  // EVENTS

    @Output() change:      EventEmitter<Object> = new EventEmitter<Object>();
    @Output() dragStart:   EventEmitter<Object> = new EventEmitter<Object>();
    @Output() dragMove:    EventEmitter<Object> = new EventEmitter<Object>();
    @Output() drop:        EventEmitter<Object> = new EventEmitter<Object>();
    @Output() snapbackEnd: EventEmitter<Object> = new EventEmitter<Object>();
    @Output() moveEnd:     EventEmitter<Object> = new EventEmitter<Object>();

    private onChangeHandler(oldPos: any, newPos: any) {
        this.change.emit({oldPos, newPos});
    }

    private onDragStart(source: string, piece: string, position: any, orientation: string) {
        if (this.game.isGameOver() ||
           (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
           (this.game.turn() === 'b' && piece.search(/^w/) !== -1))
        {
            return false;
        } else {
            return true;
        }
    }

    private onDragMove(newLocation: any, oldLocation: any, source: string, piece: string, position: any, orientation: string) {
    }

    private onDrop(source: string, target: string, piece: string, newPos: any, oldPos: any, orientation: string) {
        let move = null;
        
        try {
            move = this.game.move({from: source, to: target, promotion: 'q'});
        } catch(e) {
            move = null;
        }
        
        if (move === null) {
            return 'snapback';
        }

        const moves = this.game.history();
        this.lastMove.emit(moves[moves.length-1]);

        this._position = newPos;
        this.positionChange.emit(this.game.fen());

        return '';
    }

    private onSnapbackEnd(piece: string, square: string, position: any, orientation: string) {
    }

    private onMoveEnd(oldPos: any, newPos: any) {
        this._position = newPos;
    }

    private onSnapEnd(source: string, target: string, piece: string) {
        this.board.position(this.game.fen());
    }

    private load() {
        this.board = ChessBoard('ng2-board', {
          'position': this._position,
          'orientation': this._orientation ? 'white' : 'black',
          'showNotation': this._showNotation,
          'draggable': this._draggable,
          'dropOffBoard': this._dropOffBoard,
          'pieceTheme': this._pieceTheme,
          'moveSpeed': this._moveSpeed,
          'snapbackSpeed': this._snapbackSpeed,
          'snapSpeed': this._snapSpeed,
          'sparePieces': this._sparePieces,

          'onDragStart': this.onDragStart.bind(this),
          'onChange': this.onChangeHandler.bind(this),
          'onDragMove': this.onDragMove.bind(this),
          'onDrop': this.onDrop.bind(this),
          'onSnapbackEnd': this.onSnapbackEnd.bind(this),
          'onMoveEnd': this.onMoveEnd.bind(this),
          'onSnapEnd' : this.onSnapEnd.bind(this)
        });
    }
}
