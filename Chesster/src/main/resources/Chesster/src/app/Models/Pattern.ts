export interface Pattern {
    id: string,
    title: string;
    bitBoardHash: number;
    fen: string;
    turn: string;   // white or black
    moves: string;
    notes: string;
    source: string;
    created: string;
}