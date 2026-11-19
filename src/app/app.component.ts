import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { createPartnerClient } from '../../public/sdk/client.js';
import { createThemeController } from '../../public/lib/theme.js';
import { initialState, NotesController } from './notes-controller';

@Component({ selector: 'app-root', imports: [CurrencyPipe], templateUrl: './app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
  readonly state = signal(initialState());
  private notes?: NotesController;
  private theme?: ReturnType<typeof createThemeController>;
  private readonly visibility = () => this.notes?.setVisible(document.visibilityState === 'visible');
  private readonly pagehide = () => this.ngOnDestroy();
  isGroup() { return this.state().context?.kind === 'group'; }
  recordName() {
    const context = this.state().context;
    return context?.kind === 'group' ? context.name : this.state().property?.address ?? context?.address ?? 'Choose a record in the testing page.';
  }
  groupType() { const context = this.state().context; return context?.kind === 'group' ? context.groupType : undefined; }
  marketingRole() { const context = this.state().context; return context?.kind === 'group' ? undefined : context?.marketingRole; }
  ngOnInit() {
    this.theme = createThemeController({ document, window, hostOwned: true, fontSource: 'bundled' });
    const hostOrigin = new URLSearchParams(location.search).get('hostOrigin');
    if (window.parent === window || !hostOrigin) {
      this.state.set({ ...initialState(), status: 'Open the local mock host, or pair this address in the developer website.' });
      return;
    }
    try {
      const client = createPartnerClient({ hostOrigin });
      this.notes = new NotesController(client, value => this.state.set(value), look => this.theme?.setLook(look, { persist: false }));
      this.visibility();
      document.addEventListener('visibilitychange', this.visibility);
      window.addEventListener('pagehide', this.pagehide, { once: true });
      void this.notes.connect();
    } catch { this.state.set({ ...initialState(), status: 'The testing page address is invalid. Reopen the app from the developer website.', error: true }); }
  }
  read() { void this.notes?.refresh(); }
  save() { void this.notes?.save(); }
  edit(event: Event) { this.notes?.edit((event.target as HTMLTextAreaElement).value); }
  cancel() { this.notes?.cancelRead(); }
  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibility); window.removeEventListener('pagehide', this.pagehide);
    this.notes?.destroy(); this.theme?.dispose();
  }
}
