import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {RadarPlotComponent} from './radar-plot/radar-plot.component';
import {PcpPlotComponent} from './pcp-plot/pcp-plot.component';

@NgModule({
	declarations: [
		AppComponent,
		RadarPlotComponent,
		PcpPlotComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}
