export interface ChessNotationTurn {
    turn: number;
    whiteMove: string;
    whiteFen: string;
    whiteMoveStyle?: string;
    blackMove: string;
    blackFen: string;
    blackMoveStyle?: string;
}

export enum Sides {
    WHITE = 0,
    BLACK = 1
}