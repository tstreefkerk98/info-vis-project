import {Component} from '@angular/core';
import {PlayerService, SelectedPlayer} from './player.service';
import {Observable} from 'rxjs';
import {Player} from '../assets/interfaces/player';

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

	constructor(public playerService: PlayerService) {
		this.topRatedPlayers$ = playerService.getTopRatedPlayers$(10);
		this.lowestRatedPlayers$ = playerService.getTopRatedPlayers$(10, true);
	}

	// TODO: combine these functions
	isPlayerSelected(selectedPlayers: SelectedPlayer[], player: Player) {
		return !!selectedPlayers.find(selectedPlayer => selectedPlayer.player === player);
	}

	temp(selectedPlayers: SelectedPlayer[], player: Player): string {
		const selectedPlayer = selectedPlayers.find(selectedPlayer => selectedPlayer.player === player);
		if (!!selectedPlayer) {
			return selectedPlayer.color;
		}
		return '';
	}
}
