import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {MatTimepickerModule} from '@angular/material/timepicker';
@Component({
  imports: [MatFormFieldModule, MatDatepickerModule , MatInput, MatTimepickerModule],
  selector: 'app-schedule',
  styleUrl: './schedule.scss',
  templateUrl: './schedule.html',
  providers: [provideNativeDateAdapter()],
})
export class Schedule {

}
