import { Component, ViewChild } from '@angular/core';
import { ChessboardComponent } from '../chessboard/chessboard.component';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ChessboardComponent, ButtonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
    public position : string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq 1 0';

    @ViewChild("board") board : any;

    public move() {
        this.board.move("e2-e4");
        console.log(this.board.fen());
    }
}
