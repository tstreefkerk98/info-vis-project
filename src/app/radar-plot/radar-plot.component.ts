import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../player.service';
import {ColorService} from '../color.service';
import {TitleCasePipe} from '@angular/common';

const d3 = require('d3');

@Component({
	selector: 'app-radar-plot',
	templateUrl: './radar-plot.component.html',
	styleUrls: ['./radar-plot.component.less']
})
export class RadarPlotComponent implements OnInit {

	radius: number = 300;
	features: string[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'];

	constructor(
		public playerService: PlayerService,
		public colorService: ColorService,
		private titleCasePipe: TitleCasePipe) {
	}

	ngOnInit(): void {
		this.createRadarPlot();
	}

	createRadarPlot() {
		this.playerService.filteredPlayers$.subscribe(players => {
			const data = players.map(player => {
				const point = {};
				this.features.forEach(f => point[f] = player[f]);
				return point;
			});

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
					.attr('opacity', 0.8);
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
					.attr('stroke', 'black');

				svg.append('text')
					.attr('x', label_coordinate.x)
					.attr('y', label_coordinate.y)
					.style('text-anchor', 'middle')
					.text(this.titleCasePipe.transform(feature));
			})

			const colors = this.colorService.saturateHexs('#ff0000', data.length);

			data.forEach((d, i) => {
				const color = colors[i];
				const coordinates = this.getPathCoordinates(d, this.features, radialScale);

				svg.append('path')
					.datum(coordinates)
					.attr('d', line)
					.attr('stroke-width', 3)
					.attr('stroke', color)
					.attr('fill', 'none')
					.attr('stroke-opacity', 1)
					.attr('opacity', 0.6)
					.on('mouseover', function (d, i) {
						d3.select(this).transition()
							.duration(50)
							.attr('opacity', '.25')
					})
					.on('mouseout', function (d, i) {
						d3.select(this).transition()
							.duration(50)
							.attr('opacity', '1')
					});
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
			return this.angleToCoordinate(angle, dataPoint[feature], radialScale)
		});
		coordinates.push(coordinates[0]);
		return coordinates;
	}
}
