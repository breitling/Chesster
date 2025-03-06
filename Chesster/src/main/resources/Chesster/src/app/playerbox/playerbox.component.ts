import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

import { Player } from '../Models/Player';
import { CommonModule } from '@angular/common';
import { DataService } from '../Services/DataService.service';
import { Pieces } from '../Models/ChessNotationTurn';

@Component({
    selector: 'playerbox',
    standalone: true,
    imports: [CommonModule, AvatarModule],
    templateUrl: './playerbox.component.html',
    styleUrl: './playerbox.component.scss'
})
export class PlayerBoxComponent implements OnInit, OnChanges {
    @Input() public player: Player;
    @Input() public align: string;
    @Input() public color: string;
    @Input() public fen: string;

//  PIECES CSS CLASSES

    public pawnKlass:   string = '';
    public rookKlass:   string = '';
    public queenKlass:  string = '';
    public knightKlass: string = '';
    public bishopKlass: string = '';

    constructor(private dataService : DataService) {
        this.player = {name: 'Player', rating: 1500, country: 'USA' };
        this.align = 'top';
        this.color = 'white';
        this.fen = '';
    }

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.fen.length > 0) {
            this.pawnKlass = this.capturedPieces(Pieces.PAWN);
            this.knightKlass = this.capturedPieces(Pieces.KNIGHT);
            this.bishopKlass = this.capturedPieces(Pieces.BISHOP);
            this.rookKlass = this.capturedPieces(Pieces.ROOK);
            this.queenKlass = this.capturedPieces(Pieces.QUEEN);
        }
    }

    public capturedPieces(p : Pieces) {
        return "captured-pieces-cpiece " + this.computeClassFromFEN(this.color, p);
    }

    private computeClassFromFEN(c: string, p : Pieces) : string {
        let klass = 'captured-pieces-' + (c === 'white' ? 'w-' : 'b-');

        if (p === Pieces.QUEEN) {
            const piece = c === 'white' ? 'Q' : 'q';

            if (this.fen.substring(0, this.fen.indexOf(' ')).includes(piece) === false)
                klass = klass + 'queen';
            else
                klass = '';
        } else if (p === Pieces.PAWN) {
            const piece = c === 'white' ? 'P' : 'p';
            const count = 8 - (this.fen.substring(0, this.fen.indexOf(' ')).split(piece).length - 1);

            if (count == 1)
                klass = klass + 'pawn';
            else if (count > 1)
                klass = klass + count + '-pawns';
            else
                klass = '';
        } else {
            let piece = '  nbr'.charAt(p);

            if (c === 'white')
                piece = piece.toUpperCase();

            const count = 2 - (this.fen.substring(0, this.fen.indexOf(' ')).split(piece).length - 1);

            if (count == 1)
                klass = klass + this.pieceName(p);
            else if (count > 1)
                klass = klass + count + '-' + this.pieceName(p) + 's';
            else
                klass = '';
        }

        return klass;
    }

    private pieceName(p : Pieces) {
        switch(p) {
            case Pieces.PAWN:   return 'pawn';
            case Pieces.KNIGHT: return 'knight';
            case Pieces.BISHOP: return 'bishop';
            case Pieces.ROOK:   return 'rook';
            case Pieces.QUEEN:  return 'queen';
            case Pieces.KING:   return 'king';
        }

        return '';
    }
}
