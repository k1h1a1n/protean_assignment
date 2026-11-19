import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventSetup } from './event-setup';
import { INITIAL_EVENT } from './event.model';

describe('EventSetup', () => {
  let component: EventSetup;
  let fixture: ComponentFixture<EventSetup>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSetup);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('starts with the initial event, which is valid', () => {
    expect(component.eventFormModel()).toEqual(INITIAL_EVENT);
    expect(component.eventForm().valid()).toBe(true);
  });

  it('typing an event name updates the form', () => {
    const nameInput = element.querySelector<HTMLInputElement>('input[placeholder="Enter event name"]')!;
    nameInput.value = 'Music Night';
    nameInput.dispatchEvent(new Event('input'));

    expect(component.eventFormModel().eventName).toBe('Music Night');
  });

  it('Save with an empty event name shows "Event name is required"', async () => {
    component.eventFormModel.update((event) => ({ ...event, eventName: '' }));
    await component.onSubmit(new Event('submit'));
    await fixture.whenStable();

    expect(element.querySelector('mat-error')?.textContent?.trim()).toBe('Event name is required');
  });

  it('Save with an error puts an error icon on that tab', async () => {
    component.eventFormModel.update((event) => ({ ...event, eventName: '' }));
    await component.onSubmit(new Event('submit'));
    await fixture.whenStable();

    expect(element.querySelectorAll('.tab-error').length).toBe(1);
  });

  it('Save with a wrong ticket tier opens the Ticket Tiers tab', async () => {
    component.eventFormModel.update((event) => ({ ...event, ticketTiers: [{ tierName: 'VIP', price: null }] }));
    await fixture.whenStable();
    await component.onSubmit(new Event('submit'));
    await fixture.whenStable();

    expect(element.querySelector('.mdc-tab--active')?.textContent).toContain('Ticket Tiers');
  });
});
