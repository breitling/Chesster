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
