import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

import { Player } from '../Models/Player';

@Component({
  selector: 'playerbox',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './playerbox.component.html',
  styleUrl: './playerbox.component.scss'
})
export class PlayerBoxComponent {
    @Input() public player: Player;
    @Input() public align: string;

    constructor() {
        this.player = {name: 'Player', rating: 1500, country: 'USA' };
        this.align = 'top';
    }
}
