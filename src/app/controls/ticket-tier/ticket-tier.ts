import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  imports: [MatFormFieldModule, MatInputModule , MatIconModule , MatButtonModule],
  selector: 'app-ticket-tier',
  styleUrl: './ticket-tier.scss',
  templateUrl: './ticket-tier.html',
})
export class TicketTier {}
