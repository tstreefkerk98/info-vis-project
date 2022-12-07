import { Component, OnInit } from '@angular/core';
import {PlayerService} from "../player.service";
import {ColorService} from "../color.service";
import {TitleCasePipe} from "@angular/common";

//import * as d3 from '../custom-d3'

const d3 = require('d3');

@Component({
  selector: 'app-pcp-plot',
  templateUrl: './pcp-plot.component.html',
  styleUrls: ['./pcp-plot.component.less']
})
export class PcpPlotComponent implements OnInit {
	variable: string;

	radius: number = 250;
	features: string[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic'];
	allPCPLines: any = null
	selectedPCPLines: any = null;

	constructor(public playerService: PlayerService) {
	}

	ngOnInit(): void {
		this.variable = "Hello World"

		// set the dimensions and margins of the graph
		const margin = {top: 30, right: 10, bottom: 10, left: 0},
			width = 500 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		// append the svg object to the body of the page
		const svg = d3.select("#my_dataviz")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				`translate(${margin.left},${margin.top})`);


		//remove deselected players
		// this.playerService.lastSelectedPlayer$.subscribe(player => {
		// 	if (player.color === null) {
		// 		const index = this.pathAssignments.findIndex(assignment => assignment.playerId === player.player.sofifa_id);
		// 		this.pathAssignments[index].path.remove();
		// 		return;
		// 	}

		this.playerService.players$.subscribe(allPlayers => {

		})

		// draw selected players on top of the graph
		this.playerService.selectedPlayers$.subscribe(selectedPlayers => {
			// For each dimension, I build a linear scale. I store all in a y object
			const players = selectedPlayers.map(selectedPlayers => selectedPlayers.player)
			const y = {}
			for (let i in this.features) {
				let name = this.features[i]
				y[name] = d3.scaleLinear()
					.domain(d3.extent(players, function(d) { return +d[name]; }))
					.range([height, 0])
			}

			// Build the X scale -> it find the best position for each Y axis
			let x = d3.scalePoint()
				.range([0, width])
				.padding(1)
				.domain(this.features);

			// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
			function path(obj) {
				return d => d3.line()(obj.features.map(p => [x(p), y[p](d.player[p])]));
			}

			//create a new pcp group
			let group = svg.append('g');

			// Draw the lines
			group.selectAll("myPath")
				.data(selectedPlayers)
				.join("path")
				.attr("d",  path(this))
				.style("fill", "none")
				.style("stroke", selectedPlayers => selectedPlayers.color)
				.style("opacity", 1)

			// Draw the axis:
			group.selectAll("myAxis")
				// For each dimension of the dataset I add a 'g' element:
				.data(this.features).enter()
				.append("g")
				// I translate this element to its right position on the x axis
				.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
				// And I build the axis with the call function
				.each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
				// Add axis title
				.append("text")
				.style("text-anchor", "middle")
				.attr("y", -11)
				.text(function(d) { return d; })
				.style("fill", "black")

			// overwrite the previous pcp lines
			if (this.selectedPCPLines != null){
				this.selectedPCPLines.remove()
			}
			this.selectedPCPLines = group
		})
	}
}
