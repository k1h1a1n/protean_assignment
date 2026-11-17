import { Component } from '@angular/core';
import { Schedule } from '../controls/schedule/schedule';
import { TicketTier } from '../controls/ticket-tier/ticket-tier';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [MatTabsModule, Schedule, TicketTier, MatFormFieldModule, MatButtonModule, MatCard , MatInputModule, MatIconModule],
  selector: 'app-event-setup',
  styleUrl: './event-setup.scss',
  templateUrl: './event-setup.html',
})
export class EventSetup {}

