export interface Strength {
    score : number;
    forcedMate : boolean;
    mateIn : number;
}

export interface Move {
    lan : string;
    strength : Strength;
    pv : number;
    depth : number;
    continuation : string [];
}

export interface Analysis {
    number: number;
    fen: string;
    move: string;
    bestMove: Move;
}
