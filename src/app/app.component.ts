import { Component, InjectionToken, inject, OnDestroy, OnInit } from '@angular/core';
import { createPartnerClient, type PartnerClient } from '../../public/sdk/client.js';
import { createThemeController } from '../../public/lib/theme.js';

// Your assistant can put your first name here. It is display text, never context.
const configuredFirstName = '';
export const WELCOME_RUNTIME = new InjectionToken('Dezrez welcome runtime', {
  providedIn: 'root', factory: () => ({ createThemeController, createPartnerClient }),
});
export function welcomeName(value: string | null): string {
  const name = (value ?? '').trim();
  return name && name.length <= 60 && !/[\u0000-\u001f\u007f]/.test(name) ? name : '';
}

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
  private readonly runtime = inject(WELCOME_RUNTIME);
  readonly firstName = welcomeName(new URLSearchParams(location.search).get('firstName')) || welcomeName(configuredFirstName);
  private theme?: ReturnType<typeof createThemeController>;
  private client?: PartnerClient;
  private cleanups: Array<() => void> = [];
  private destroyed = false;
  private readonly pagehide = () => this.ngOnDestroy();
  ngOnInit() {
    this.theme = this.runtime.createThemeController({ document, window, hostOwned: true, fontSource: 'hosted' });
    window.addEventListener('pagehide', this.pagehide, { once: true });
    const hostOrigin = new URLSearchParams(location.search).get('hostOrigin');
    if (window.parent === window || !hostOrigin) return;
    try {
      const client = this.client = this.runtime.createPartnerClient({ hostOrigin });
      this.cleanups.push(client.on('partner.theme', value => this.theme?.setLook(value.look, { persist: false })));
      this.cleanups.push(client.on('partner.closed', () => this.ngOnDestroy()));
      // Connect only for the host's appearance and lifecycle. No record is chosen
      // and this welcome app never sends a broker read or write request.
      void client.connect().then(value => {
        if (!this.destroyed) this.theme?.setLook(value.theme.look, { persist: false });
      }).catch(() => { /* The welcome remains usable without a host. */ });
    } catch { /* An unpaired welcome remains usable. */ }
  }
  ngOnDestroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    window.removeEventListener('pagehide', this.pagehide);
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.client?.destroy(); this.theme?.dispose();
  }
}
