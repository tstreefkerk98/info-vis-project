import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../player.service';
import {ColorService} from '../color.service';
import {TitleCasePipe} from '@angular/common';

const d3 = require('d3');

interface PathAssignment {
	playerId: number,
	path: any,
}

@Component({
	selector: 'app-radar-plot',
	templateUrl: './radar-plot.component.html',
	styleUrls: ['./radar-plot.component.less']
})
export class RadarPlotComponent implements OnInit {

	radius: number = document.documentElement.clientWidth / 6;
	features: string[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'];
	pathAssignments: PathAssignment[] = [];

	constructor(
		public playerService: PlayerService,
		public colorService: ColorService,
		private titleCasePipe: TitleCasePipe) {
	}

	ngOnInit(): void {
		this.createRadarPlot();
	}

	createRadarPlot() {
		const svg = d3.select('#radar-plot-container').append('svg')
			.attr('width', 2 * this.radius)
			.attr('height', 2 * this.radius);

		const radialScale = d3.scaleLinear()
			.domain([0, 100])
			.range([0, this.radius * 2 / 3]);
		const ticks = [20, 40, 60, 80, 100];

		const line = d3.line()
			.x(d => d.x)
			.y(d => d.y);

		ticks.forEach(tick => {
			const dataPoint = {}
			this.features.forEach(feature => dataPoint[feature] = tick);
			const coordinates = this.getPathCoordinates(dataPoint, this.features, radialScale);

			svg.append('path')
				.datum(coordinates)
				.attr('d', line)
				.attr('stroke-width', 1)
				.attr('stroke', 'black')
				.attr('fill', 'none')
				.attr('stroke-opacity', 1)
				.attr('opacity', 0.25);
		});

		this.features.forEach((feature, i) => {
			const angle = (Math.PI / 2) + (2 * Math.PI * i / this.features.length);
			const line_coordinate = this.angleToCoordinate(angle, 100, radialScale);
			const label_coordinate = this.angleToCoordinate(angle, 115, radialScale);

			svg.append('line')
				.attr('x1', this.radius)
				.attr('y1', this.radius)
				.attr('x2', line_coordinate.x)
				.attr('y2', line_coordinate.y)
				.attr('stroke', 'black')
				.attr('opacity', '0.25');

			svg.append('text')
				.attr('x', label_coordinate.x)
				.attr('y', label_coordinate.y)
				.style('text-anchor', 'middle')
				.text(this.titleCasePipe.transform(feature));
		})

		this.playerService.playerSelection$.subscribe(selectedPlayers => {
			if (selectedPlayers.selectedPlayers.length === 0) {
				this.pathAssignments.forEach(assignment => assignment.path.remove());
				this.playerService.resetUsedColors();
				return;
			}

			const player = selectedPlayers.selectedPlayers.find(selectedPlayer => selectedPlayer.player.sofifa_id === selectedPlayers.lastPlayerId);
			if (!player) {
				const index = this.pathAssignments.findIndex(assignment => assignment.playerId === selectedPlayers.lastPlayerId);
				this.pathAssignments[index].path.remove();
				this.pathAssignments.splice(index, 1);
				return;
			}

			const d = {};
			this.features.forEach(f => d[f] = player.player[f]);

			const coordinates = this.getPathCoordinates(d, this.features, radialScale);

			const group = svg.append('g');

			group.append('path')
				.datum(coordinates)
				.attr('d', line)
				.attr('stroke-width', 2)
				.attr('stroke', player.color)
				.attr('fill', 'none')
				.attr('stroke-opacity', 1);

			group.selectAll('circle')
				.data(coordinates.slice(0, -1))
				.enter()
				.append('circle')
				.attr('cx', function (d) { return d.x })
				.attr('cy', function (d) { return d.y })
				.attr('r', 4)
				.style('fill', player.color)
				.on('mouseover', function (e, d) {
					d3.select(this).transition()
						.duration(50)
						.attr('r', 8);

					d3.select(this.parentNode).insert('rect', 'text')
						.attr('x', d.x - 12)
						.attr('y', d.y - 30)
						.attr('width', 24)
						.attr('height', 20)
						.attr('stroke', 'black')
						.attr('class', 'stat-label')
						.style('fill', 'white');

					d3.select(this.parentNode).append('text')
						.attr('x', d.x)
						.attr('y', d.y - 15)
						.attr('fill', player.color)
						.attr('font-size', '16px')
						.style('text-anchor', 'middle')
						.attr('class', 'stat-label')
						.text(d.value);

					d3.select(this.parentNode).raise();
				})
				.on('mouseout', function (e, d) {
					d3.selectAll('.stat-label').remove();
					d3.select(this).transition()
						.duration(50)
						.attr('r', 4)
				});

			this.pathAssignments.push({
				playerId: player.player.sofifa_id,
				path: group,
			});
		});
	}

	angleToCoordinate(angle, value, radialScale) {
		const x = Math.cos(angle) * radialScale(value);
		const y = Math.sin(angle) * radialScale(value);
		return {'x': this.radius + x, 'y': this.radius - y};
	}

	getPathCoordinates(dataPoint, features, radialScale) {
		const coordinates = features.map((feature, i) => {
			const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
			const coordinates = this.angleToCoordinate(angle, dataPoint[feature], radialScale);
			coordinates['value'] = dataPoint[feature];
			return coordinates;
		});
		coordinates.push(coordinates[0]);
		return coordinates;
	}
}
