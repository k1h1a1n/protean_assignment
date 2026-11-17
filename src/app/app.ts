import { Component, signal } from '@angular/core';
import { EventSetup } from './event-setup/event-setup';

@Component({
  selector: 'app-root',
  imports: [EventSetup],
  template: `<app-event-setup></app-event-setup>`,
  styles: ``
})
export class App {
  protected readonly title = signal('assesment');
}
