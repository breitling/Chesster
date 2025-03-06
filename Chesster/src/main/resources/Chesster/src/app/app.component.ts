import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { PrimeNG } from 'primeng/config';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { SidebarComponent } from './sidebar/sidebar.component';
import { DataService } from './Services/DataService.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ButtonModule, SidebarComponent, MenubarModule, DialogModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    providers: [DataService]
})
export class AppComponent implements OnInit {
    title = 'Chesster';

    items: MenuItem[] | undefined;
    visible: boolean = false;

    constructor(private primeng: PrimeNG, private dataService : DataService) {
        //@ts-ignore
        dataService.setJavaConnector(window['getJavaConnector']);
    }

    ngOnInit(): void {
        this.items = [
        {
            label: 'File',
//          icon: 'pi pi-search',
            items: [
                {
                    label: 'Exit',
                    command: () => { 
                        this.dataService.getJavaConnector().exit(0);
                    },
                }
            ]
        },
        {
            label: 'Help',
            items: [
                {
                    label: 'Open Logs',
                },
                {
                    label: 'About Chesster...',
                    command: () => {
                        this.showDialog();
                    }
                }
            ]
        }];
    }

    public showDialog() {
        this.visible = true;
    }
}
