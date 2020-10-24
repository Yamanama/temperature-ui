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
  public radarChartLabels = [ 'Celsius', 'Farenheit', 'Humidity'];
  public radarChartData = [
    {data: [0, 0, 0], label: 'DHT11'}
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
            label: "Humidity",
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
    this.client = webSocket({url: 'ws://10.0.0.118:8080', deserializer: ({data}) => data});
    // subscribe to the websocket
    let counter = 0;
    this.client.subscribe(msg => {
      // massage the message
      msg = JSON.parse(msg);
      msg.fahrenheit = (msg['temperature'] * 9/5) + 32;
      console.log(msg);
      // update the radar chart
      this.radarChartData[0].data = [];
      this.radarChartData[0].data = [ msg['temperature'], msg['fahrenheit'], msg['humidity'] ];
      // update the line chart
      this.chart.chart.data.datasets[0].data.push(msg['temperature']);
      this.chart.chart.data.datasets[1].data.push(msg['fahrenheit']);
      this.chart.chart.data.datasets[2].data.push(msg['humidity']);
      this.chart.chart.data.labels.push(counter);
      // remove the first element after 10 elements are present
      if (this.chart.chart.data.labels.length > 10) {
        this.chart.chart.data.datasets[0].data.shift();
        this.chart.chart.data.datasets[1].data.shift();
        this.chart.chart.data.datasets[2].data.shift();
        this.chart.chart.data.labels.shift();
      }
      // update the chart
      counter += 2;
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
