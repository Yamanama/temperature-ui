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
  // radar chart vars
  public radarChartLabels = [ 'Celsius', 'Farenheit', 'Voltage'];
  public radarChartData = [
    {data: [0, 0, 0], label: 'TMP36'}
  ];
  public radarChartType = 'radar';
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
            label: "Celsius",
            borderColor: 'red',
            backgroundColor: 'rgba(255,0,0,0.28)',
            fill: true
          },
          {
            data: [],
            label: "Fahrenheit",
            borderColor: 'blue',
            fill: true
          },
          {
            data: [],
            label: "Voltage",
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
    this.client = webSocket('ws://10.0.0.156:8080');
    // subscribe to the websocket
    this.client.subscribe(msg => {
      // update the radar chart
      this.radarChartData[0].data = [];
      this.radarChartData[0].data = [ msg['celsius'], msg['fahrenheit'], msg['voltage']*100 ];
      // update the line chart
      this.chart.chart.data.datasets[0].data.push(msg['celsius']);
      this.chart.chart.data.datasets[1].data.push(msg['fahrenheit']);
      this.chart.chart.data.datasets[2].data.push(msg['voltage']);
      this.chart.chart.data.labels.push(msg['time']);
      // remove the first element after 10 elements are present
      if (this.chart.chart.data.labels.length > 10) {
        this.chart.chart.data.datasets[0].data.shift();
        this.chart.chart.data.datasets[1].data.shift();
        this.chart.chart.data.datasets[2].data.shift();
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
