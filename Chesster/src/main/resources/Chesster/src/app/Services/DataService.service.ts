import { EventEmitter, Injectable, NgZone } from "@angular/core";

import { ChessEngine } from "../Models/chessengine";
import { Move } from "../Models/Move";
import { Database } from "../Models/Database";
import { Game } from "../Models/Game";
import { Variation } from "../Models/Variation";
import { Note } from "../Models/Note";
import { Pattern } from "../Models/Pattern";


@Injectable({
    providedIn: 'root'
})
export class DataService {

    private javaConnector: Function;

    private database! : Database;
    private games : Game [];
    private game! : Game;

    private preloadedGame : Game | undefined;

    public gameReviewEmitter : EventEmitter<string> = new EventEmitter();

//  BOARDS

    private clearBoard : string = '8/8/8/8/8/8/8/8';
//  private startBOard : string = 'rnbqkbnr/pppppppp/8/8/8/8/pppppppp/RNBQKBNR';
    private chessPositionBoard : string = this.clearBoard;

    constructor (private ngZone: NgZone) {
        this.javaConnector = () => { return 'TBI'; };
        this.games = [];
        this.preloadedGame = undefined;
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

    public getDatabase() {
        return this.database;
    }

    public setDatabase(d : Database) {
        this.database = d;
    }

    public getSelectedGame() {
        return this.game;
    }

    public setSelectedGame(game : Game) {
        if (this.game)
            this.game = game;
    }

    public getCurrentGames() {
        return this.games;
    }

    public setCurrentGames(games : Game []) {
        this.games = games;
    }

    public doPreload() {
        return this.preloadedGame != undefined;
    }

    public getPreloadedGame() : Game {
        if (this.preloadedGame != undefined)
            return this.preloadedGame;
        else
            throw new Error('no preloaded games set!');
    }

    public unsetPreload() {
        this.preloadedGame = undefined;
    }

    public setPreload(game : Game) {
        this.preloadedGame = this.cloneGame(game);
    }

    public getChessPositionBoard() : string {
        return this.chessPositionBoard;
    }
    
    public setChessPositionBoard(fen : string) {
        this.chessPositionBoard = fen.length > 0 ? fen : this.clearBoard;
    }

//  JAVA CONNECTOR CALLS

    public databaseExists(name : string) : boolean {
        return this.javaConnector().databaseExists(name);
    }

    public exists(path : string) : boolean {
        return this.javaConnector().exists(path);
    }

    public async getAnalysis(index : number, fen : string) : Promise<Move> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getAnalysis(this.engines()[index].path, fen);
            const move : Move = JSON.parse(data);

            if (move != null)
                resolve(move);
            else
                reject('Analysis error on ' + fen);
        });
    }

    public async getDatabases() : Promise<Database []> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getDatabases();
            const databases : Database [] = JSON.parse(data);

         // this.log(data);

            if (databases != null)
                resolve(databases);
            else
                reject('Failed to get databases from backend.');
        });
    }

    public async getFiles(dir : string) : Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getFiles(dir);
            const files : Array<any> = JSON.parse(data);

            if (files)
                resolve(files);
            else
                reject('Failed to find files.');
        });
    }

    public async getGames(id : string) : Promise<Game []> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getGames(id);

            console.log(data);
            
            const games : Game [] = JSON.parse(data);

            if (games)
                resolve(games);
            else
                reject('Failed to get games');
        });
    }

    public async findGames(id: string, fen : string) : Promise<Game []> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().findGames(id, fen);
            const games : Game [] = JSON.parse(data);

            if (games)
                resolve(games);
            else
                reject('Failed to find games');
        });
    }

    public async saveGame(id : string, game : Game, variations: string, generate : boolean) : Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const b = this.javaConnector().saveGame(id, JSON.stringify(game), variations, generate);

            if (b)
                resolve(b);
            else
                reject(false);
        });
    }

    public async updateGame(id : string, game : Game, variations: string) : Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const b = this.javaConnector().updateGame(id, JSON.stringify(game), variations);

            if (b)
                resolve(b);
            else
                reject(false);
        });
    }

    public deleteGame(id : string, gid : string) {
        return this.javaConnector().deleteGame(id, gid);
    }

    public log(m : string) {
        this.javaConnector().consoleLog(m);
    }

    public saveDatabase(name: string, path: string, notes: string) {
        return this.javaConnector().saveDatabase(name, path, notes);
    }

    public updateDatabase(id: string, name: string, path: string, notes: string) : string {
        return this.javaConnector().updateDatabase(id, name, path, notes);
    }

    public deleteDatabase(id : string) {
        return this.javaConnector().deleteDatabase(id);
    }

    public async import(id : string) : Promise<string> {
        return new Promise((resolve, reject) => {
            const r = this.javaConnector().importGames(id);

            if (r == 'Success')
                resolve(r);
            else
                reject('Failed to import games.');
        });
    }

    public async getGamesFromCDC(account: string, year: string, month: string, timeClass: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getGamesFromCDC(account, year, month, timeClass);

            if (data)
                resolve(data);
            else
                reject('Failed to import games from Chess.com.');
        });
    }

    public doGameReview(index : number, depth: number, g :  Game, progressBarCallback : Function) : string {
        let rc = '';
        let progress = 0;

        this.ngZone.runOutsideAngular(() => {
            const interval = setInterval(() => {
                this.ngZone.run(() => {
                    progress = this.javaConnector().reviewGame(this.engines()[index].path, depth, progress, JSON.stringify(g));
                    progressBarCallback(progress);
                    if (progress >= 100) {
                        this.gameReviewEmitter.emit('Done');
                        clearInterval(interval);
                    }
                });
            }, 1000);
        });

        return rc;
    }

    public async abortReview() : Promise<string> {
        return new Promise((resolve, reject) => {
            const msg = this.javaConnector().abortReview();

            if (msg == 'Aborted')
                resolve('Review Aborted.');
            else
                reject('Failed to abort review.');
        });
    }

    public getReviewAnalysis() : any [] {
        const data = this.javaConnector().getReviewAnalysis();
        return JSON.parse(data);
    }

    public doGarbageCollection() : string {
        return this.javaConnector().doGC();
    }

    public async getNotes(id: string, gameid: string) : Promise<Note []> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getNotes(id, gameid);
            const notes : Note [] = JSON.parse(data);

            if (notes)
                resolve(notes);
            else
                reject('Failed to get notes.');
        });
    }

    public async saveNote(id: string, note : Note) : Promise<boolean> {
        return new Promise((resolve, reject) => {
            const b = this.javaConnector().saveNote(id, JSON.stringify(note));

            if (b)
                resolve(true);
            else
                reject('Failed to save note.')
        });
    }

    public async deleteNote(id: string, note: Note) : Promise<boolean> {
        return new Promise((resolve, reject) => {
            const b = this.javaConnector().deleteNote(id, note.id);

            if (b)
                resolve(true);
            else
                reject('Failed to delete note.')
        });
    }

    public async getPatterns() : Promise<Pattern []> {
        return new Promise((resolve, reject) => {
            const data = this.javaConnector().getPatterns();
            const patterns : Pattern [] = JSON.parse(data);

         // this.log(data);

            if (patterns != null)
                resolve(patterns);
            else
                reject('Failed to get patterns from backend.');
        });
    }

    public async addPattern(pattern : Pattern) : Promise<string> {
        return new Promise((resolve, reject) => {
            const rc = this.javaConnector().addPattern(JSON.stringify(pattern));

            if (rc != null)
                resolve(rc);
            else
                reject('Failed to add pattern.');
        });
    }

    public async updatePattern(pattern : Pattern) : Promise<string> {
        return new Promise((resolve, reject) => {
            const rc = this.javaConnector().updatePattern(JSON.stringify(pattern));

            if (rc != null)
                resolve(rc);
            else
                reject('Failed to update pattern.');
        });
    }

    public async deletePattern(id : string) : Promise<string> {
        return new Promise((resolve, reject) => {
            const rc = this.javaConnector().deletePattern(id);

            if (rc != null)
                resolve(rc);
            else
                reject('Failed to delete pattern.');
        });
    }

// FACTORIES

    createGame() : Game {
        return { id : '', sourceId : '', white : '', whiteELO : '', black : '', blackELO : '', event : '', site : '', eventDate : '', timeControl : '', 
                 round : 0, date : '', result : 'NORESULT', eco : '', fen : '', moveCount : 0, moves : '', variations: [] }
    }

    cloneGame(g : Game) : Game {
        return { id : g.id, sourceId : g.sourceId, white : g.white, whiteELO : g.whiteELO, black : g.black, blackELO : g.blackELO, event : g.event, 
            site : g.site, eventDate : g.eventDate, timeControl : g.timeControl, round : g.round, date : g.date, result : g.result, eco : g.eco, 
            fen : g.fen, moveCount : g.moveCount, moves : g.moves, variations : g.variations}
    }

    creatNewChessEngine() : ChessEngine {
        return { name: 'Lc0', elo: 1200, version: "1.0.0", path: '', loaded: false, go: { t: '', c: 0 }, settings:[] };
    }

    createVariation(index: number) : Variation {
        return { index: index, fen: '', moves: '0.', startingFen: '', side: 0, turn: 0, moveCount: 0};
    }

    createNote(gameid : string) : Note {
        return { id: '', gameId: gameid, note : '', created: new Date() };
    }

    createPattern() : Pattern {
        return { id: '', title: '', bitBoardHash: 0, fen: '', turn: 'White', moves: '', notes: '', source: '', created: '' };
    }

//  CHESS ENGINES

    public engineIndex() {
        return 1; // SF 17.1
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
                        "value": 12
                    },
                    {
                        "name": "Hash",
                        "value": 4096
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
            },
            {
                "name": "Stockfish 17.1",
                "version": "17.1",
                "path": "C:\\Users\\bobbr\\Desktop\\Chess\\Stockfish\\stockfish-17\\stockfish-windows-x86-64-avx2.exe",
                "elo": 3800,
                "loaded": true,
                "go": {
                    "t": "Time",
                    "c": 30000
                },
                "settings": [
                    {
                        "name": "Threads",
                        "value": 12
                    },
                    {
                        "name": "Hash",
                        "value": 4096
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