import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from '../Services/DataService.service';

declare var $: any;
declare var ChessBoard: any;

@Component({
    selector: 'ng2-chessposition',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chessposition.component.html',
    styleUrl: './chessposition.component.scss'
})
export class ChessPositionComponent implements OnInit {

    private board : any;
    private _position: any;

    constructor(private dataService : DataService) {
    }

    public ngOnInit() {
       this.load();
    }

    @Input()
    set position(value: any) {
        this._position = value;
        if (this.board) 
            this.board.position(value, true);
    }

     @Output() positionChange : EventEmitter<any> = new EventEmitter<any>();

//  PUBLIC METHODS

    get position() : any {
         return this.board.position;
    }

    public clear() {
        this.board.clear(false);
    }

    public start() {
        this.board.position('start');
    }

    public fen() : string {
        return this.board.fen();
    }

//  PRIVATE METHODS

    private load() {
        this.board = ChessBoard('ng2-position', {
            'draggable': true,
            'sparePieces': true,
            'showNotation': false,
            'dropOffBoard': 'trash',
            'pieceTheme': 'assets/img/defaults/{piece}.png',
            'position': this._position
        });
    }
}
