import {Component} from '@angular/core';
import {PlayerService, SelectedPlayer} from './player.service';
import {Observable} from 'rxjs';
import {Player} from '../assets/interfaces/player';

const d3 = require('d3');

interface Stat {
	key: string,
	header: string,
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'angular-app';

	topRatedPlayers$: Observable<Player[]>;
	lowestRatedPlayers$: Observable<Player[]>;

	unselectedPlayer = 'player not selected'

	displayedStats: Stat[] = [
		{key: 'short_name', header: 'Name'},
		{key: 'pace', header: 'Pace'},
		{key: 'shooting', header: 'Shooting'},
		{key: 'passing', header: 'Passing'},
		{key: 'dribbling', header: 'Dribbling'},
		{key: 'defending', header: 'Defending'},
		{key: 'physic', header: 'Physic'},
		{key: 'age', header: 'Age'},
		{key: 'height_cm', header: 'Height'},
		{key: 'weight_kg', header: 'Weight'},
	]

	constructor(public playerService: PlayerService) {
		this.topRatedPlayers$ = playerService.getTopRatedPlayers$(10);
		this.lowestRatedPlayers$ = playerService.getTopRatedPlayers$(10, true);
	}

	playerColor(selectedPlayers: SelectedPlayer[], player: Player): string {
		const selectedPlayer = selectedPlayers.find(selectedPlayer => selectedPlayer.player === player);
		if (!!selectedPlayer) {
			return selectedPlayer.color;
		}
		return this.unselectedPlayer;
	}
}
