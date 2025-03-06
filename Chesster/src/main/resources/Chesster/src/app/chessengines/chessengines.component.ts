import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';

import { ChessEngine } from '../Models/chessengine';
import { DataService } from '../Services/DataService.service';

@Component({
    selector: 'app-chessengines',
    standalone: true,
    imports: [CommonModule,ButtonModule],
    templateUrl: './chessengines.component.html',
    styleUrl: './chessengines.component.scss',
    providers: [DataService]
})
export class ChessEnginesComponent implements OnInit {
    
    engines: ChessEngine [];

    @ViewChild("dv") dataView : DataView | undefined;

    constructor(private dataService : DataService) {
        this.engines = [];
    }

    ngOnInit() {
        this.dataService.getEngines().then((data : ChessEngine []) => {
            this.engines = data;
        });
    }

    public addEngine() {
        this.engines.push(this.dataService.creatNewChessEngine());
    }
}
