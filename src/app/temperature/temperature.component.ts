import { AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css']
})
export class TemperatureComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chart', {static: true}) private chartRef;
  chart: any;
  client: any;

  constructor() {}

  gaugeType = "semi";
  gaugeValue = 28.3;
  gaugeLabel = "RPM";
  gaugeAppendText = "";
  /**
   * AfterViewInit Lifecycle hook
   */
  ngAfterViewInit(): void {
    // instantiate the line chart
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: "RPMs",
            borderColor: 'green',
            fill: true
          }
        ]
      }
    });
  }
  /**
   * OnInit Lifecycle hook
   */
  ngOnInit(): void {
    // establish the websocket connection
    this.client = webSocket('ws://localhost:8080');
    // subscribe to the websocket
    this.client.subscribe(msg => {
      // update the radar chart
      // this.radarChartData[0].data = [];
      // this.radarChartData[0].data = [ msg['celsius'], msg['fahrenheit'], msg['voltage']*100 ];
      this.gaugeValue = msg['rpmMeasured'];
      // update the line chart
      this.chart.chart.data.datasets[0].data.push(msg['rpmMeasured']);
      this.chart.chart.data.labels.push(msg['time']);
      // remove the first element after 10 elements are present
      if (this.chart.chart.data.labels.length > 50) {
        this.chart.chart.data.datasets[0].data.shift();
        this.chart.chart.data.labels.shift();
      }
      // update the chart
      this.chart.update();
    });
    
  }
  /**
   * OnDestroy Lifecycle hook
   */
  ngOnDestroy():void {
    // cleanup
    this.client.disconnect();
    this.client.close();
    this.client.unsubscribe();
    
  }
}
