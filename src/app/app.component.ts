import {Component} from '@angular/core';
import {Filter, PlayerService} from './player.service';
import {Observable} from 'rxjs';
import {Player} from '../assets/interfaces/player';
import {FormBuilder, FormGroup} from '@angular/forms';

const d3 = require('d3');

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	title = 'angular-app';

	contactForm: FormGroup;

	topRatedPlayers$: Observable<Player[]>;
	lowestRatedPlayers$: Observable<Player[]>;

	constructor(
		private playerService: PlayerService,
		private formBuilder: FormBuilder,
	) {
		this.topRatedPlayers$ = playerService.getTopRatedPlayers$(10);
		this.lowestRatedPlayers$ = playerService.getTopRatedPlayers$(10, true);

		this.contactForm = this.formBuilder.group({
			firstName: '',
			lastName: '',
		});
	}

	onSubmit() {
		const firstName = this.contactForm.get('firstName')?.value;
		const lastName = this.contactForm.get('lastName')?.value;
		console.log(firstName, lastName);
	}
}
