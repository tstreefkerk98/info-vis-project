import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Player} from "../assets/interfaces/player";
import {BehaviorSubject, combineLatest, first, map, Observable, ReplaySubject} from "rxjs";


interface Filter {
	key: string,
	value: number | string | null
}

@Injectable({
	providedIn: 'root'
})
export class PlayerService {

	players$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();
	filteredPlayers$: ReplaySubject<Player[]> = new ReplaySubject<Player[]>();
	filters$: BehaviorSubject<Filter[]> = new BehaviorSubject<Filter[]>([]);

	constructor(private http: HttpClient) {
		this.http.get('assets/data/player_data.csv', {responseType: 'text'}).subscribe(
			data => {
				const rows = data.split('\n');
				const headers = rows[0].split(';');

				const players = rows.slice(1).map(row => {
					const arr = row.split(';');
					const player = {};
					for (let i = 0; i < arr.length - 1; i++) {
						player[headers[i]] = arr[i];
					}
					return player as Player;
				});
				this.players$.next(players);
				this.filteredPlayers$.next(players);
			}
		);

		combineLatest(this.players$, this.filters$).subscribe(([players, filters]) => {
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
		})
	}
}
