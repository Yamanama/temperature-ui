import { Injectable } from '@angular/core';
import * as serial from "browser-serialport";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { 
    serial.list(ports => {
      ports.forEach(function(port) {
        console.log(port.comName);
        console.log(port.pnpId);
        console.log(port.manufacturer);
      });
    })
    console.log("DSFSD");
//     var serialPort = new SerialPort("COM3", {
//   baudrate: 9600
// });
  }
}
