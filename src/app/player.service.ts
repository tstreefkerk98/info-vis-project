import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Player} from '../assets/interfaces/player';
import {BehaviorSubject, combineLatest, first, ReplaySubject} from 'rxjs';


export interface Filter {
	key: string,
	value: number | string | null | { min: number, max: number },
}

export interface SelectedPlayer {
	player: Player,
	color: string | null,
}

export interface PlayerSelection {
	selectedPlayers: SelectedPlayer[],
	lastPlayerId: number
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {

	players$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>(1);
	filters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);
	filteredPlayers$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>(1);

	playerSelection$: BehaviorSubject<PlayerSelection> = new BehaviorSubject<PlayerSelection>({
		selectedPlayers: [],
		lastPlayerId: -1,
	});
	allColors: string[] = [
		'#4e79a7',
		'#f28e2c',
		'#e15759',
		'#76b7b2',
		'#59a14f',
		'#edc949',
		'#af7aa1',
		'#ff9da7',
		'#9c755f',
		'#bab0ab'
	];
	usedColors: string[] = [];
	debugMode: boolean = false;

	reverseFilter: string[] = ['value_eur', 'cost_eur', 'age', 'wage_eur'];

	specificPositions = ['ls', 'st', 'rs', 'lw', 'lf', 'cf', 'rf', 'rw', 'lam', 'cam', 'ram', 'lm', 'lcm', 'cm', 'rcm', 'rm', 'lwb', 'ldm', 'cdm', 'rdm', 'rwb', 'lb', 'lcb', 'cb', 'rcb', 'rb']
	positionsAtk = ['ls', 'st', 'rs', 'lw', 'lf', 'cf', 'rf', 'rw']
	positionsMid = ['lam', 'cam', 'ram', 'lm', 'lcm', 'cm', 'rcm', 'rm', 'ldm', 'cdm', 'rdm']
	positionsDef = ['lwb', 'rwb', 'lb', 'lcb', 'cb', 'rcb', 'rb']

	positionsLw = ['lw'];
	positionsSt = ['ls', 'rs', 'st'];
	positionsCf = ['lf', 'cf', 'rf'];
	positionsRw = ['rw'];
	positionsLm = ['lm'];
	positionsCam = ['lam', 'cam', 'ram'];
	positionsCm = ['lcm', 'cm', 'rcm'];
	positionsCdm = ['ldm', 'cdm', 'rdm'];
	positionsRm = ['rm'];
	positionsWb = ['lb', 'lwb', 'rb', 'rwb'];
	positionsCb = ['lcb', 'rcb', 'cb'];
	positionGroupNames = [
		'st',
		'cf',
		'rw',
		'lw',
		'rm',
		'lm',
		'cam',
		'cm',
		'cdm',
		'wb',
		'cb',
	];
	positionGroups = [
		this.positionsSt,
		this.positionsCf,
		this.positionsRw,
		this.positionsLw,
		this.positionsRm,
		this.positionsLm,
		this.positionsCam,
		this.positionsCm,
		this.positionsCdm,
		this.positionsWb,
		this.positionsCb,
	];

	constructor(private http: HttpClient) {
		this.http.get('assets/data/player_data.csv', {responseType: 'arraybuffer'}).subscribe(
			bufferData => {
				const enc = new TextDecoder('iso-8859-2');
				const data = (enc).decode(bufferData);
				const rows = data.split('\n');
				const headers = rows[0].split(';');

				const content_rows = this.debugMode ? rows.slice(1, 250) : rows.slice(1)

				const players = content_rows.map(row => {
					const arr = row.split(';');
					const player = {};
					for (let i = 0; i < arr.length - 1; i++) {
						player[headers[i]] = isNaN(+arr[i]) ? arr[i] : +arr[i];
					}
					const valuesPerPosition = this.specificPositions.map(position => {
						if (player[position]) {
							return eval(player[position] + ((player[position].slice(-1) === '+') ? '0' : ''))
						}
						return 0;
					});
					const maxIndex = valuesPerPosition.indexOf(Math.max(...valuesPerPosition));
					const specificPosition = this.specificPositions[maxIndex];
					player['specific_position'] = specificPosition.toUpperCase();
					if (this.positionsAtk.includes(specificPosition)) {
						player['position'] = 'atk'
					} else if (this.positionsMid.includes(specificPosition)) {
						player['position'] = 'mid'
					} else if (this.positionsDef.includes(specificPosition)) {
						player['position'] = 'def'
					} else {
						console.warn(specificPosition + ' is not a valid position')
						player['position'] = null
					}
					const groupIndex = this.positionGroups.findIndex(group => group.includes(specificPosition));
					if (groupIndex === -1) {
						console.warn(specificPosition + ' is not a member of a position group');
					}
					player['position_group'] = this.positionGroupNames[groupIndex].toUpperCase();
					return player as Player;
				});
				// Filter goalkeepers
				this.players$.next(players.filter(player => !!player.pace));
			}
		);

		combineLatest([this.players$, this.filters$]).subscribe(([players, filters]) => {
			this.filteredPlayers$.next(
				players.filter(player => {
					for (let i = 0; i < filters.length; i++) {
						const filter = filters[i];
						if (typeof filter.value === 'number') {
							if (this.reverseFilter.includes(filter.key)) {
								if (player[filter.key] >= filter.value) {
									return false
								}
							} else {
								if (player[filter.key] <= filter.value) {
									return false;
								}
							}
						} else if (typeof filter.value === 'string') {
							if (!player[filter.key].toLowerCase().includes(filter.value.toLowerCase())) {
								return false;
							}
						} else {
							if (player[filter.key] < filter.value.min && player[filter.key] > filter.value.max) {
								return false;
							}
						}
					}
					return true;
				}).slice(0, 500)
			);
		});
	}

	resetUsedColors(): void {
		this.usedColors = [];
	}

	// Pass a new filter, update an existing one, or pass value: null to remove filter.
	updateFilters(filter: Filter) {
		// use long_name instead of short_name during filtering
		if (filter.key === 'short_name') {
			filter.key = 'long_name';
		}
		this.filters$.pipe(first()).subscribe(filters => {
			const index = filters.findIndex(obj => obj.key === filter.key);
			if (index === -1 && filter.value !== null) {
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

	sortFilteredPlayers(key: string, highToLow: boolean) {
		this.filteredPlayers$.pipe(first()).subscribe(players => {
			this.filteredPlayers$.next(players.sort((a, b) => {
					if (typeof (a[key]) === 'string') {
						return (highToLow)
							? b[key].localeCompare(a[key].firstname)
							: a[key].localeCompare(b[key].firstname)
					}
					return (highToLow)
						? b[key] - a[key]
						: a[key] - b[key]
				}
			))
		})
	}

	// Adds player to selectedPlayers$ if it is not already present, otherwise removes it.
	selectPlayer(player: Player): void {
		this.playerSelection$.pipe(first()).subscribe(playerSelection => {
			const index = playerSelection.selectedPlayers.findIndex(selectedPlayer => selectedPlayer.player === player);
			// Add player to selection
			if (index === -1) {
				const color = this.selectColor();
				if (color) {
					this.playerSelection$.next({
						selectedPlayers: playerSelection.selectedPlayers.concat({player, color}),
						lastPlayerId: player.sofifa_id
					});
				}
			//	Remove player from selection
			} else {
				const colorIndex = this.usedColors.findIndex(color => color === playerSelection.selectedPlayers[index].color);
				this.usedColors.splice(colorIndex, 1);
				playerSelection.selectedPlayers.splice(index, 1);
				this.playerSelection$.next({
					selectedPlayers: playerSelection.selectedPlayers,
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
