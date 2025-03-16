import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Pattern } from '../Models/Pattern';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DataService } from '../Services/DataService.service';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ChessPositionComponent } from "../chessposition/chessposition.component";
import { PanelModule } from 'primeng/panel';
import { FlexModule } from '@angular/flex-layout';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ChessboardComponent } from "../chessboard/chessboard.component";
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-patterns',
    standalone: true,
    imports: [CommonModule, FlexModule, ButtonModule, TableModule, FormsModule, MessageModule, TooltipModule, ChessPositionComponent, SelectModule,
              ConfirmDialogModule, PanelModule, InputTextModule, TextareaModule, ChessboardComponent],
    templateUrl: './patterns.component.html',
    styleUrl: './patterns.component.scss',
    providers: [ConfirmationService]
})
export class PatternsComponent implements OnInit {

    public count: number;
    public pattern : Pattern;
    public patterns : Pattern [];
    public boardWidth : string = '400px';

    public selectedPattern : Pattern | undefined;

    public chessPositionBoard : string;

    public messages = signal<any []>([]);
     
    public adding : boolean;
    public editing : boolean;
    public showButtons : boolean = false;
    public orientation : boolean = true;

    @ViewChild("board1") board1 : any;
    @ViewChild("board2") board2 : any;
    @ViewChild("board3") board3 : any;

    public turns: string [];

    constructor(private confirmationService: ConfirmationService, private dataService : DataService) {
        this.pattern = dataService.createPattern();
        this.adding = false;
        this.editing = false;
        this.patterns = [];
        this.count = 0;
        this.chessPositionBoard = '';
        this.messages.set([]);

        this.turns = [ 'White', 'Black' ];
    }

    ngOnInit(): void {
        this.getPatterns();
        this.count = this.patterns.length;
    }

//  CALLBACKS

    public onRowSelect(event:any) {
        this.orientation = true;
        this.board2.orientation = this.orientation;
    }

    public onRowUnselect(event:any) {
        this.selectedPattern = undefined;
    }

    public flipboard() {
        if (this.orientation) {
            this.orientation = false;
            this.board2.orientation = this.orientation;
        } else {
            this.orientation = true;
            this.board2.orientation = this.orientation;
        }
    }

    public add() {
        this.adding = true;
        this.pattern = this.dataService.createPattern();
    }

    public cancel(b:boolean) {
        this.adding = false;
        this.editing = false;
        if (b) this.selectedPattern = undefined;
    }

    public clear(n : number) {
        if (n === 1)
            this.board1.clear();
        else
            this.board3.clear();
    }

    public start(n : number) {
        if (n === 1)
            this.board1.start();
        else
            this.board3.start();
    }

    public addPattern() {
        if (this.pattern.title.length > 0) {
            this.pattern.fen = this.board1.fen();
            this.dataService.addPattern(this.pattern).then(
                (response) => {
                    this.messages.set([{ severity : 'success', text: response}]);
                    this.adding = false;
                    this.getPatterns();
                },
                (error) => {
                    this.messages.set([{ severity : 'error', text: error}]);
                //  this.patterns.push(this.pattern);
                //  this.adding = false;
                }
            );
        } else {
            this.messages.set([{ severity : 'error', text: 'No title.'}]);
        }
    }

    public editPattern() {
        this.editing = true;
        if (this.selectedPattern)
            this.pattern = this.selectedPattern;
    }

    public confirmDelete(event: Event) {
        console.log("Got Here.");
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            icon: 'pi pi-info-circle',
            message: 'Do you want to delete this pattern?',
            header: 'Delete Pattern',
            rejectLabel: 'Cancel',

            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger',
            },

            accept: () => {
                if (this.selectedPattern) {
                    this.pattern = this.selectedPattern;
                    this.deletePattern();
                }
            },
            reject: () => {
                this.messages.set([{ severity: 'error', text: 'Pattern not deleted' }]);
            },
        });
    }

    public deletePattern() {
        console.log('Got here..')
        this.dataService.deletePattern(this.pattern.id).then(
            (response) => {
                this.messages.set([{ severity : 'success', text: response}]);
                this.selectedPattern = undefined;
                this.getPatterns();
            },
            (error) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

    public updatePattern() {
        this.pattern.fen = this.board3.fen();
        this.dataService.updatePattern(this.pattern).then(
            (response) => {
                this.messages.set([{ severity : 'success', text: response}]);
                this.editing = false;
            },
            (error) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

    public getPatterns() {
        this.dataService.getPatterns().then(
            (data) => {
                this.patterns = data;
                this.count = data.length;
            },
            (error : string) => {
                this.messages.set([{ severity : 'error', text: error}]);
            }
        );
    }

//   PRIVATE METHODS

}
