import { Component, InjectionToken, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { createPartnerClient, type PartnerClient } from '../../public/sdk/client.js';
import { createViewerClient, type ViewerClient } from '../../public/sdk/viewer.js';
import { createThemeController } from '../../public/lib/theme.js';

export const WELCOME_RUNTIME = new InjectionToken('Dezrez welcome runtime', {
  providedIn: 'root', factory: () => ({ createThemeController, createPartnerClient, createViewerClient }),
});
const unavailable = 'Your name could not be loaded. Sign in to the developer website, then reconnect your app to try again.';

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
  private readonly runtime = inject(WELCOME_RUNTIME);
  readonly firstName = signal<string | null>(null);
  readonly statusMessage = signal('Loading your name from Dezrez…');
  private theme?: ReturnType<typeof createThemeController>;
  private client?: PartnerClient;
  private viewer?: ViewerClient;
  private cleanups: Array<() => void> = [];
  private destroyed = false;
  private readonly pagehide = () => this.ngOnDestroy();
  ngOnInit() {
    this.theme = this.runtime.createThemeController({ document, window, hostOwned: true, fontSource: 'hosted' });
    window.addEventListener('pagehide', this.pagehide, { once: true });
    const hostOrigin = new URLSearchParams(location.search).get('hostOrigin');
    if (window.parent === window || !hostOrigin) { this.statusMessage.set(unavailable); return; }
    try {
      const client = this.client = this.runtime.createPartnerClient({ hostOrigin });
      // This read-only facade must observe initialization before core connect.
      const viewer = this.viewer = this.runtime.createViewerClient({ client, hostOrigin });
      this.cleanups.push(client.on('partner.theme', value => this.theme?.setLook(value.look, { persist: false })));
      this.cleanups.push(client.on('partner.closed', () => this.ngOnDestroy()));
      // The parent reads the signed-in negotiator's FirstName through its API.
      // No token, record context or manually configured name enters this app.
      void client.connect().then(async value => {
        if (this.destroyed) return;
        this.theme?.setLook(value.theme.look, { persist: false });
        const current = await viewer.getCurrentViewer();
        if (this.destroyed) return;
        const name = current.firstName;
        if (typeof name !== 'string' || !name || name.trim() !== name || [...name].length > 60 || /[\p{Cc}\p{Cf}\p{Cs}\u2028\u2029]/u.test(name)) {
          this.statusMessage.set(unavailable); return;
        }
        this.firstName.set(name); this.statusMessage.set('');
      }).catch(() => { if (!this.destroyed) this.statusMessage.set(unavailable); });
    } catch { this.statusMessage.set(unavailable); }
  }
  ngOnDestroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.firstName.set(null); this.statusMessage.set('This app connection has ended.');
    window.removeEventListener('pagehide', this.pagehide);
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.viewer?.destroy(); this.client?.destroy(); this.theme?.dispose();
  }
}
