import { Routes } from '@angular/router';
import { ChessEnginesComponent } from './chessengines/chessengines.component';
import { DatabasesComponent } from './databases/databases.component';
import { GamesComponent } from './games/games.component';
import { UserComponent } from './user/user.component';
import { BoardComponent } from './board/board.component';
import { ChessboardComponent } from './chessboard/chessboard.component';

export const routes: Routes = [
    { path: 'engines', component: ChessEnginesComponent },
    { path: 'databases', component: DatabasesComponent },
    { path: 'games', component: GamesComponent },
    { path: 'user', component: UserComponent },
    { path: 'board', component: BoardComponent },
    { path: 'chessboard', component: ChessboardComponent }
    
];

