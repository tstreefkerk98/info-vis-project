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

	svg = d3.select("#my_dataviz");
	axis: any;
	lines = {
		selected: null,
		all: null
	}
	xScale: any = null;
	yScale: any = null;

	allPlayers: any
	selectedPlayers: any


	constructor(public playerService: PlayerService) {
	}

	ngOnInit(): void {
		// set the dimensions and margins of the graph
		const margin = {top: 30, right: 10, bottom: 10, left: 0},
			width = document.documentElement.clientWidth - margin.left - margin.right,
			height = document.documentElement.clientHeight*2/3 - margin.top - margin.bottom;

		// append the svg object to the body of the page
		this.svg = d3.select("#my_dataviz")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		this.playerService.filteredPlayers$.subscribe(allPlayers => {
			// For each feature, build a linear y scale
			this.yScale = {}
			for (let i in this.features) {
				let name = this.features[i]
				this.yScale[name] = d3.scaleLinear()
					.domain(d3.extent(allPlayers, function(d) { return +d[name]; }))
					.range([height, 0])
			}

			// Build an x scale
			this.xScale = d3.scalePoint()
				.range([0, width])
				.padding(1)
				.domain(this.features);

			this.drawAxis()
			this.drawLines("all", allPlayers)
		})

		// draw selected players on top of the graph
		this.playerService.playerSelection$.subscribe(playerSelection => {
			this.drawLines("selected", playerSelection.selectedPlayers)
		})
	}

	updatePlot(draggedFeature = null){
		const x = this.xScale
		d3.selectAll(".draggable")
			.transition()
			.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
			.duration(function(d) { return d == draggedFeature ? 0 : 300 });
		this.drawLines("all", this.allPlayers)
		this.drawLines("selected", this.selectedPlayers)
	}

	drawAxis(){
		//create new axis
		const obj = this
		const group = this.svg.append('g');
		const x = this.xScale
		const y = this.yScale
		const dimensions = this.features
		group.selectAll("myAxis")
			.data(this.features).enter()
			.append("g")
			.classed("draggable", true)
			.attr("transform", function(d) { return "translate(" + x(d) + ")"; })
			.each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
			.call(d3.drag()
				.on("start", function(event, d) {
				})
				.on("drag", function(event, d) {
					const pos = a => a == d ? event.x : x(a)
					const originalDimensions = dimensions.slice();
					dimensions.sort(function(a, b) { return pos(a) - pos(b) });
					if (dimensions.toString() != originalDimensions.toString()){
						x.domain(dimensions);
						obj.updatePlot(d)
					}
					d3.select(this).attr("transform", function(d) { return "translate(" + event.x + ")"; })
				})
				.on("end", function(event, d) {
					obj.updatePlot(d)
				}))
				.on('mouseover', function (e, d) {
					d3.select(this).style("cursor", "move");
				})
			// Add axis title
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", -11)
			.text(function(d) { return d; })
			.style("fill", "black")


		// overwrite the previous axis
		if (this.axis != null){
			this.axis.remove()
		}

		this.axis = group
	}

	drawLines(data_type: string, data: any){
		let path, color, opacity, stroke_width
		if (data_type == "selected") {
			this.selectedPlayers = data
			path = d => d3.line()(this.features.map(p => [this.xScale(p), this.yScale[p](d.player[p])]))
			color = selectedPlayers => selectedPlayers.color
			opacity = 1
			stroke_width = 4
		}
		else{
			this.allPlayers = data
			data_type = "all"
			path = d => d3.line()(this.features.map(p => [this.xScale(p), this.yScale[p](d[p])]))
			color = "black"
			//dynamically choose the opacity based on number of players
			opacity = Math.min(1/8, 150/this.allPlayers.length)
			stroke_width = 1
		}

		// Draw the lines
		let group = this.svg.append('g');
		group.selectAll("myPath")
			.data(data)
			.join("path")
			.attr("d",  path)
			.style("fill", "none")
			.style("stroke", color)
			.style("opacity", opacity)
			.style("stroke-width", stroke_width)

		// Overwrite the previous lines
		if (this.lines[data_type] != null){
			this.lines[data_type].remove()
		}
		this.lines[data_type] = group
	}
}
