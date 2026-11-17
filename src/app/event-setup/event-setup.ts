import { Component } from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import { Schedule } from '../controls/schedule/schedule';
import { TicketTier } from '../controls/ticket-tier/ticket-tier';
@Component({
  imports: [MatTab , MatTabGroup , Schedule , TicketTier],
  selector: 'app-event-setup',
  styleUrl: './event-setup.scss',
  templateUrl: './event-setup.html',
})
export class EventSetup {}
