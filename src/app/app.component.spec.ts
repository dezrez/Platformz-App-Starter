import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { AppComponent } from './app.component';
import { initialState } from './notes-controller';

describe('standalone Angular UI', () => {
  it('renders truthful unpaired guidance, disabled host actions and icons beside every heading', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges(); await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[data-partner-status]')?.textContent).toContain('local mock host');
    expect((root.querySelector('[data-partner-read]') as HTMLButtonElement).disabled).toBe(true);
    expect((root.querySelector('[data-partner-save]') as HTMLButtonElement).disabled).toBe(true);
    expect(root.querySelectorAll('header .char[aria-hidden="true"]').length).toBe(2);
    expect(root.querySelector('textarea')?.getAttribute('maxlength')).toBe('500');
    fixture.destroy();
  });
  it('renders a no-record dashboard widget without property controls, note fields or invented context', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    fixture.componentInstance.state.set({ ...initialState(), connected: true, surface: 'dashboard-widget', context: null, status: 'Widget ready. No record is selected.' });
    fixture.detectChanges(); await fixture.whenStable(); const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('No record is selected'); expect(root.querySelector('[data-partner-read]')).toBeNull(); expect(root.querySelector('textarea')).toBeNull();
    expect(root.querySelector('header .char-screen[aria-hidden="true"]')).not.toBeNull(); fixture.destroy();
  });
});
