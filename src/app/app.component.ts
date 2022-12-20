import {Component} from '@angular/core';
import {Filter, PlayerService, SelectedPlayer} from './player.service';
import {Observable} from 'rxjs';
import {Player} from '../assets/interfaces/player';

interface Stat {
	key: string,
	header: string,
	sortState: SortState,
}

enum SortState {
	noSort,
	highLow,
	lowHigh,
}

enum FilterType {
	slider,
	value,
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'Fifa manager';

	topRatedPlayers$: Observable<Player[]>;
	lowestRatedPlayers$: Observable<Player[]>;

	unselectedPlayer = 'player not selected'

	displayedStats: Stat[] = [
		{key: 'short_name', header: 'Name', sortState: SortState.noSort},
		{key: 'overall', header: 'Rating', sortState: SortState.noSort},
		{key: 'potential', header: 'Potential', sortState: SortState.noSort},
		{key: 'pace', header: 'Pace', sortState: SortState.noSort},
		{key: 'shooting', header: 'Shooting', sortState: SortState.noSort},
		{key: 'passing', header: 'Passing', sortState: SortState.noSort},
		{key: 'dribbling', header: 'Dribbling', sortState: SortState.noSort},
		{key: 'defending', header: 'Defending', sortState: SortState.noSort},
		{key: 'physic', header: 'Physic', sortState: SortState.noSort},
		{key: 'age', header: 'Age', sortState: SortState.noSort},
		{key: 'height_cm', header: 'Height', sortState: SortState.noSort},
		{key: 'weight_kg', header: 'Weight', sortState: SortState.noSort},
		{key: 'value_eur', header: 'Budget', sortState: SortState.noSort},
		{key: 'wage_eur', header: 'Wage', sortState: SortState.noSort},
	]

	FilterType = FilterType;

	filterDistribution = {
		short_name: {
			filterType: FilterType.value,
			checkBoxChecked: false,
			value: '',
		},
		overall: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},

		potential: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		pace: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		shooting: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		passing: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		dribbling: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		defending: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		physic: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		age: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		height_cm: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		weight_kg: {
			filterType: FilterType.slider,
			checkBoxChecked: false,
			value: 50,
		},
		value_eur: {
			filterType: FilterType.value,
			checkBoxChecked: false,
			value: 0,
		},
		wage_eur: {
			filterType: FilterType.value,
			checkBoxChecked: false,
			value: 0,
		},
	}


	widerDataKeys: string[] = ['value_eur', 'wage_eur']

	constructor(public playerService: PlayerService) {}

	playerColor(selectedPlayers: SelectedPlayer[], player: Player): string {
		const selectedPlayer = selectedPlayers.find(selectedPlayer => selectedPlayer.player === player);
		if (!!selectedPlayer) {
			return selectedPlayer.color;
		}
		return this.unselectedPlayer;
	}

	sortByKey(key: string) {
		const statToSort = this.displayedStats.find(stat => stat.key === key);
		if (statToSort.sortState === SortState.noSort || statToSort.sortState === SortState.lowHigh) {
			this.playerService.sortFilteredPlayers(key, true)
			statToSort.sortState = SortState.highLow;
		} else if (statToSort.sortState === SortState.highLow) {
			this.playerService.sortFilteredPlayers(key, false)
			statToSort.sortState = SortState.lowHigh;
		}
	}

	updateFilterValue(key, target) {
		this.filterDistribution[key].value = isNaN(+target.value) ? target.value : +target.value;
		this.playerService.updateFilters({
			key, value: this.filterDistribution[key].value
		});
	}

	onCheckBoxChange(key, target) {
		this.filterDistribution[key].checkBoxChecked = target.checked;
		this.playerService.updateFilters({
			key, value: (target.checked) ? this.filterDistribution[key].value : null
		});
	}
}
