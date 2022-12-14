import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Player} from '../assets/interfaces/player';
import {BehaviorSubject, combineLatest, first, map, Observable, ReplaySubject} from 'rxjs';


export interface Filter {
	key: string,
	value: number | string | null | { min: number, max: number }
}

export interface SelectedPlayer {
	player: Player,
	color: string | null,
}

export interface PlayerSelection {
	players: SelectedPlayer[],
	lastPlayerId: number
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {

	players$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();
	filters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
	filteredPlayers$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();

	playerSelection$: BehaviorSubject<PlayerSelection> = new BehaviorSubject<PlayerSelection>({
		players: [],
		lastPlayerId: -1,
	});
	allColors: string[] = [
		'#1f78b4',
		'#33a02c',
		'#e31a1c',
		'#ff7f00',
		'#6a3d9a',
		'#ffff99',
		'#a6cee3',
		'#b2df8a',
		'#fb9a99',
		'#fdbf6f',
		'#cab2d6',
		'#b15928'
	];
	usedColors: string[] = [];

	constructor(private http: HttpClient) {
		this.http.get('assets/data/player_data.csv', {responseType: 'arraybuffer'}).subscribe(
			bufferData => {
				const enc = new TextDecoder('iso-8859-2');
				const data = (enc).decode(bufferData);
				const rows = data.split('\n');
				const headers = rows[0].split(';');

				const players = rows.slice(1).map(row => {
					const arr = row.split(';');
					const player = {};
					for (let i = 0; i < arr.length - 1; i++) {
						player[headers[i]] = isNaN(+arr[i]) ? arr[i] : +arr[i];
					}
					return player as Player;
				});
				// Filters goalkeepers
				this.players$.next(players.filter(player => !!player.pace).slice(0, 100));
			}
		);

		combineLatest([this.players$, this.filters$]).subscribe(([players, filters]) => {
			this.filteredPlayers$.next(
				players.filter(player => {
					for (let i = 0; i < filters.length; i++) {
						const filter = filters[i];
						if (typeof filter.value === 'number') {
							if (player[filter.key] <= filter.value) {
								return false;
							}
						} else if (typeof filter.value === 'string') {
							if (player[filter.key] !== filter.value) {
								return false;
							}
						} else {
							if (player[filter.key] < filter.value.min && player[filter.key] > filter.value.max) {
								return false;
							}
						}
					}
					return true;
				})
			);
		});
	}

	resetUsedColors(): void {
		this.usedColors = [];
	}

	// Pass a new filter, update an existing one, or pass value: null to remove filter.
	updateFilters(filter: Filter) {
		this.filters$.pipe(first()).subscribe(filters => {
			const index = filters.findIndex(obj => obj.key === filter.key);
			if (index === -1) {
				// Add new filter
				this.filters$.next(filters.concat(filter));
			} else if (filter.value === null) {
				// Remove existing filter
				filters.splice(index, 1);
				this.filters$.next(filters);
			} else {
				// Update existing filter
				filters[index].value = filter.value;
				this.filters$.next(filters);
			}
		});
	}

	// Adds player to selectedPlayers$ if it is not already present, otherwise removes it.
	selectPlayer(player: Player): void {
		this.playerSelection$.pipe(first()).subscribe(playerSelection => {
			const index = playerSelection.players.findIndex(selectedPlayer => selectedPlayer.player === player);
			// Add player to selection
			if (index === -1) {
				const color = this.selectColor();
				if (color) {
					this.playerSelection$.next({
						players: playerSelection.players.concat({player, color}),
						lastPlayerId: player.sofifa_id
					});
				}
			//	Remove player from selection
			} else {
				const colorIndex = this.usedColors.findIndex(color => color === playerSelection.players[index].color);
				this.usedColors.splice(colorIndex, 1);
				playerSelection.players.splice(index, 1);
				this.playerSelection$.next({
					players: playerSelection.players,
					lastPlayerId: player.sofifa_id
				});
			}
		});
	}

	selectColor(): string {
		const unusedColors = this.allColors.filter(color => !this.usedColors.includes(color));
		if (!unusedColors) {
			return null;
		}
		const newColor = unusedColors[0];
		this.usedColors.push(newColor);
		return newColor;
	}
}
