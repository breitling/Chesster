import { Injectable } from "@angular/core";
import { ChessEngine } from "../Models/chessengine";

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private javaConnector: Function;

    constructor () {
        this.javaConnector = () => { return 'TBI'; };
    }

//  COMMANDS

    public getEngines() {
        return Promise.resolve(this.engines());
    }

//  GETTERS AND SETTERS

    public getJavaConnector() : any {
        return this.javaConnector();
    }

    public setJavaConnector(f : Function) {
        this.javaConnector = f;
    }

// FACTORIES

    creatNewChessEngine() : ChessEngine {
        return { name: 'Lc0', elo: 1200, version: "1.0.0", loaded: false, go: { t: '', c: 0 }, settings:[] };
    }

    engines() : ChessEngine [] {
        return [
            {
                "name": "Stockfish 16",
                "version": "16.1",
                "path": "C:\\Users\\bobbr\\Desktop\\Chess\\Stockfish\\stockfish-16\\stockfish-windows-x86-64-avx2.exe",
                "elo": 3700,
                "loaded": true,
                "go": {
                    "t": "Time",
                    "c": 30000
                },
                "settings": [
                    {
                        "name": "Threads",
                        "value": 10
                    },
                    {
                        "name": "Hash",
                        "value": 64
                    },
                    {
                        "name": "MultiPV",
                        "value": 1
                    },
                    {
                        "name": "UCI_Elo",
                        "value": 3190
                    }
                ]
            }
        ];
    }
}