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
  it('renders a people group as inert text with a user icon and no usable property-read control', async () => {
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    fixture.componentInstance.state.set({ ...initialState(), connected: true, enabled: true, surface: 'record-action', context: { kind: 'group', id: 'group-one', agencyId: 'fictional', name: '<img src=x onerror=alert(1)>', groupType: 'Team' }, stateReady: true });
    fixture.detectChanges(); await fixture.whenStable(); const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('<img src=x onerror=alert(1)>'); expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('header .char-user[aria-hidden="true"]')).not.toBeNull();
    const read = root.querySelector('[data-partner-read]') as HTMLButtonElement; expect(read.hidden).toBe(true); expect(read.disabled).toBe(true);
    expect(root.textContent).not.toContain('Bedrooms'); fixture.destroy();
  });
});
