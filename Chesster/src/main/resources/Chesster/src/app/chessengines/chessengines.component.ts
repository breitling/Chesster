import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataView, DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';

import { ChessEngine } from '../Models/chessengine';
import { DataService } from '../Services/DataService.service';

@Component({
    selector: 'app-chessengines',
    standalone: true,
    imports: [CommonModule,DataViewModule,ButtonModule],
    templateUrl: './chessengines.component.html',
    styleUrl: './chessengines.component.scss',
    providers: [DataService],
})
export class ChessEnginesComponent implements OnInit {
    engines! : ChessEngine [];

    @ViewChild("dv") dataView : DataView | undefined;

    constructor(private dataService : DataService) {
    }

    ngOnInit() {
        this.dataService.getEngines().then((data) => (this.engines = data));
    }

    public addEngine() {
        this.engines.push(this.dataService.creatNewChessEngine());
    }
}
