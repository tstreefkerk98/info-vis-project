import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Player} from "../assets/interfaces/player";
import {map, Observable} from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class PlayerService {

	players$: Observable<Player[]>;

	constructor(private http: HttpClient) {
		this.players$ = this.http.get('assets/data/player_data.csv', {responseType: 'text'}).pipe(
			map(data => {
					const rows = data.split('\n');
					const headers = rows[0].split(';');

					return rows.slice(1).map(row => {
						const arr = row.split(';');
						const player = {};
						for (let i = 0; i < arr.length - 1; i++) {
							player[headers[i]] = arr[i];
						}
						return player as Player;
					})
				}
			)
		);
	}

	getTopRatedPlayers$(n: number): Observable<Player[]> {
		return this.players$.pipe(
			map(players => players.sort((a, b) => b.overall - a.overall).slice(0, n))
		);
	}
}
