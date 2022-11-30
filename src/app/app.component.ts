import {Component} from '@angular/core';
import {PlayerService} from "./player.service";
import {Observable} from "rxjs";
import {Player} from "../assets/interfaces/player";

const d3 = require('d3');

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'angular-app';

	topRatedPlayers$: Observable<Player[]>;
	lowestRatedPlayers$: Observable<Player[]>;

	constructor(private playerService: PlayerService) {
		this.topRatedPlayers$ = playerService.getTopRatedPlayers$(10);
		this.lowestRatedPlayers$ = playerService.getTopRatedPlayers$(10, true);
	}
}
