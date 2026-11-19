import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Schedule } from './schedule';
import { ScheduleValue } from './schedule.model';

describe('Schedule', () => {
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Schedule],
    }).compileComponents();

    fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });


  it('is invalid when nothing is entered', () => {
    expect(component.validate()).not.toBeNull();
  });

  it('is valid when the form writes a complete schedule', () => {
    component.writeValue({ date: '2026-11-20', startTime: '10:30', durationMinutes: 90 });
    expect(component.validate()).toBeNull();
  });

  it('sends the typed duration to the form', () => {
    let sent: ScheduleValue | null = null;
    component.registerOnChange((value) => (sent = value));

    const durationInput = element.querySelector<HTMLInputElement>('.duration input')!;
    durationInput.value = '90';
    durationInput.dispatchEvent(new Event('input'));

    expect(sent).toEqual({ date: null, startTime: null, durationMinutes: 90 });
  });

  it('shows every message when the form marks it touched (Save)', async () => {
    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    const messages = Array.from(element.querySelectorAll('mat-error')).map((e) => e.textContent!.trim());
    expect(messages).toEqual(['Date is required', 'Start time is required', 'Duration is required']);
  });

  it('shows a message when the duration is 0', async () => {
    component.writeValue({ date: '2026-11-20', startTime: '10:30', durationMinutes: 0 });
    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();

    const messages = Array.from(element.querySelectorAll('mat-error')).map((e) => e.textContent!.trim());
    expect(messages).toEqual(['Must be at least 1 minute']);
    expect(component.validate()).not.toBeNull();
  });
});
