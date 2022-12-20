import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {RadarPlotComponent} from './radar-plot/radar-plot.component';
import {PcpPlotComponent} from './pcp-plot/pcp-plot.component';
import {TitleCasePipe} from '@angular/common';

@NgModule({
	declarations: [
		AppComponent,
		RadarPlotComponent,
		PcpPlotComponent,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
	],
	providers: [TitleCasePipe],
	bootstrap: [AppComponent]
})
export class AppModule {
}
