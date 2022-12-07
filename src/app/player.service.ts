import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Player} from '../assets/interfaces/player';
import {BehaviorSubject, combineLatest, first, map, Observable, ReplaySubject} from 'rxjs';


export interface Filter {
	key: string,
	value: number | string | null
}

export interface SelectedPlayer {
	player: Player,
	color: string | null,
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {

	players$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();
	filters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
	filteredPlayers$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();

	selectedPlayers$: BehaviorSubject<SelectedPlayer[]> = new BehaviorSubject<SelectedPlayer[]>([]);
	lastSelectedPlayer$: ReplaySubject<SelectedPlayer> = new ReplaySubject<SelectedPlayer>();
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
	debugMode: boolean = true;

	constructor(private http: HttpClient) {
		this.http.get('assets/data/player_data.csv', {responseType: 'text'}).subscribe(
			data => {
				const rows = data.split('\n');
				const headers = rows[0].split(';');

				const content_rows = this.debugMode ? rows.slice(1, 100) : rows.slice(1)

				const players = content_rows.map(row => {
					const arr = row.split(';');
					const player = {};
					for (let i = 0; i < arr.length - 1; i++) {
						player[headers[i]] = isNaN(+arr[i]) ? arr[i] : +arr[i];
					}
					return player as Player;
				});
				// Filters goalkeepers
				this.players$.next(players.filter(player => !!player.pace));
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
						} else {
							if (player[filter.key] !== filter.value) {
								return false;
							}
						}
					}
					return true;
				})
			);
		});
	}

	getTopRatedPlayers$(n: number, reverse = false): Observable<Player[]> {
		return this.players$.pipe(
			map(players => players.sort((a, b) => {
				if (reverse) {
					return a.overall - b.overall;
				}
				return b.overall - a.overall;
			}).slice(0, n))
		);
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
		this.selectedPlayers$.pipe(first()).subscribe(selectedPlayers => {
			const index = selectedPlayers.findIndex(selectedPlayer => selectedPlayer.player === player);
			if (index === -1) {
				const color = this.selectColor();
				if (color) {
					this.selectedPlayers$.next(selectedPlayers.concat({player, color}));
					this.lastSelectedPlayer$.next({player, color});
				}
			} else {
				const colorIndex = this.usedColors.findIndex(color => color === selectedPlayers[index].color);
				this.usedColors.splice(colorIndex, 1);
				selectedPlayers.splice(index, 1);
				this.selectedPlayers$.next(selectedPlayers);
				this.lastSelectedPlayer$.next({player, color: null});
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
