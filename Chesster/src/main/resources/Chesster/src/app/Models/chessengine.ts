export interface ValuePair {
    name: string;
    value: number;
}

export interface EngineParams {
    t: string;
    c: number;
}

export interface ChessEngine {
    name: string;
    version: string;
    path?: string;
    image?: string;
    elo: number;
    loaded: boolean;
    go: EngineParams;
    settings: ValuePair [];
}