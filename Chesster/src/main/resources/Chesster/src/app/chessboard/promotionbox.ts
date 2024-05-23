import { Component, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';

import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
    standalone: true,
    imports:[CommonModule,ButtonModule],
    styles: [ "img {width: 46px; height: 46px;}"],
    template: `
        <div id="promotion" class="flex flex-column" *ngIf="turn === 'w'">
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('q')"><img src="/assets/img/defaults/wQ.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('r')"><img src="/assets/img/defaults/wR.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('b')"><img src="/assets/img/defaults/wB.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('n')"><img src="/assets/img/defaults/wN.png"></p-button>
        </div>
        <div id="promotion" class="flex flex-column" *ngIf="turn === 'b'">
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('q')"><img src="/assets/img/defaults/bQ.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('r')"><img src="/assets/img/defaults/bR.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('b')"><img src="/assets/img/defaults/bB.png"></p-button>
            <p-button [text]="true" [rounded]="true" (click)="promotionPiece('n')"><img src="/assets/img/defaults/bN.png"></p-button>
        </div>`
})
export class PromotionBox implements OnInit {
    public turn : string;

    constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig) {
        this.turn = this.config.data.turn;
    }

    ngOnInit() {
        if (this.turn === undefined || this.turn === '')
            this.turn = 'w';
    }

    closeDialog() {
        this.ref.close('q');
    }

    public promotionPiece(piece: string) {
        this.ref.close(piece);
    }
}