import { Component } from '@angular/core';

import { TooltipModule } from 'primeng/tooltip';
import { DataService } from '../Services/DataService.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [RouterModule, TooltipModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    providers: [DataService],
})
export class SidebarComponent {

    constructor(private router: Router, private dataService : DataService) {
    }

}
