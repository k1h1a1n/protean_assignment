import { Component } from '@angular/core';
import { EventSetup } from './event-setup/event-setup';

@Component({
  selector: 'app-root',
  imports: [EventSetup],
  template: `<app-event-setup></app-event-setup>`,
})
export class App {}
