import { Injectable } from '@angular/core';
import * as stomp from 'stompts';
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  client: stomp.Client;
  get isConnected() {
    return !this._onConnect;
  }

  private _onConnect?: ((boolean) => any)[];

  constructor() {
    this._onConnect = [];

    this.client = new stomp.Client('ws://10.0.0.62:15674/ws');
    this.client.connect({
      login: 'guest',
      passcode: 'guest',
      host: '/'
    }, (connect) => {
      console.log(`connected, nListeners: ${this._onConnect.length}`);
      const listeners = this._onConnect;
      this._onConnect = undefined;
      listeners.forEach((callback) => callback(true));
    });
  }

  private _subscribe(topic: string, callback: (frame: stomp.Frame) => any): stomp.ISubscription {
    if (!this.isConnected) {
      throw new Error('not connected');
    }

    return this.client.subscribe(topic, callback);
  }

  async subscribe(topic: string, callback: (frame: stomp.Frame) => any): Promise<stomp.ISubscription> {
    if (!this.isConnected) {
      await this.onConnect();
    }

    return this._subscribe(topic, callback);
  }

  onConnect(): Promise<boolean> {
    return new Promise<boolean>(
      (
        (success, reject) => {
          if (this.isConnected) {
            success(true);
          } else {
            this._onConnect.push((ok) => ok ? success(true) : reject('failed to connect'));
          }
        }
      )
    );
  }
}
