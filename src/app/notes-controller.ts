import type { PartnerClient, PropertyContext, SavedNote } from '../../public/sdk/client.js';

export interface NotesState {
  surface: 'property-action' | 'dashboard-widget';
  context: PropertyContext | null; property: PropertyContext | null; note: string; version: number;
  enabled: boolean; closed: boolean; visible: boolean; connected: boolean; synthetic: boolean;
  reading: boolean; saving: boolean; stateReady: boolean; status: string; error: boolean;
}
export const initialState = (): NotesState => ({ surface: 'property-action', context: null, property: null, note: '', version: 0,
  enabled: false, closed: false, visible: true, connected: false, synthetic: true,
  reading: false, saving: false, stateReady: false, status: 'Waiting for the testing page…', error: false });

const messages: Record<string, string> = {
  HOST_DISABLED: 'The host has paused the app.', HOST_CLOSED: 'This session has closed. Reopen the app to continue.',
  STATE_CONFLICT: 'The saved note changed elsewhere. Your text is still here. Reopen the app to load the latest version.',
  RATE_LIMITED: 'Too many requests. Wait, then choose Read property to try again.',
  SESSION_EXPIRED: 'Your session expired. Reconnect through the developer website.',
  PERMISSION_DENIED: 'This session does not allow that operation.',
  CONTEXT_CHANGED: 'The selected property changed.', CANCELLED: 'Request cancelled.',
  REQUEST_TIMEOUT: 'The response did not arrive. Reads can be tried again; check a saved note before repeating a save.',
  INVALID_NOTE: 'Enter a note of at most 500 characters.',
};
const explain = (error: unknown) => messages[(error as { code?: string })?.code ?? ''] ?? 'This action did not finish. Check the testing page and try again when it is ready.';

/** UI state only. The host owns permissions, context, storage and budgets. */
export class NotesController {
  state = initialState();
  private generation = 0;
  private disposed = false;
  private interrupting = false;
  private active = new Set<AbortController>();
  private removeListeners: (() => void)[] = [];
  constructor(private client: PartnerClient, private changed: (state: NotesState) => void, private applyTheme: (look: string) => void) {}
  private update(patch: Partial<NotesState>) {
    this.state = { ...this.state, ...patch }; this.changed(this.state);
    this.client.setActionState({ enabled: !this.interrupting && this.allowed() && this.state.stateReady && !this.state.reading && !this.state.saving && this.state.note.length <= 500 });
  }
  private allowed() { return !this.disposed && this.state.connected && this.state.enabled && !this.state.closed && this.state.visible; }
  private interrupt() {
    this.generation++;
    for (const abort of this.active) abort.abort();
    this.active.clear();
    this.interrupting = true;
    try { this.update({ reading: false, saving: false }); } finally { this.interrupting = false; }
  }
  private async request<T>(operation: 'property.read' | 'appState.get' | 'appState.set', params: object) {
    const abort = new AbortController(); this.active.add(abort);
    try { return await this.client.request(operation, params, { signal: abort.signal }) as T; }
    finally { this.active.delete(abort); }
  }
  async connect() {
    this.removeListeners.push(
      this.client.on('theme', ({ look }: { look: string }) => this.applyTheme(look)),
      this.client.on('context', (context: PropertyContext | null) => {
        this.interrupt();
        this.update({ surface: context === null ? 'dashboard-widget' : 'property-action', context, property: null, note: '', version: 0, stateReady: false, status: context === null ? 'Widget ready. No record is selected.' : 'Selected property changed.', error: false });
        void this.refresh();
      }),
      this.client.on('enabled', ({ enabled }: { enabled: boolean }) => {
        this.interrupt(); this.update({ enabled, status: enabled ? 'App ready.' : 'The host has paused the app.', error: false });
        if (enabled && !this.state.stateReady) void this.refresh();
      }),
      this.client.on('action', ({ action, actionId }: { action: string; actionId?: string }) => { if (action === 'save') void this.save(actionId); }),
      this.client.on('closed', () => {
        this.interrupt(); this.update({ closed: true, enabled: false, status: 'This session has closed. Reopen the app to continue.', error: false });
      }),
    );
    try {
      const init = await this.client.connect();
      if (this.disposed) return;
      this.applyTheme(init.theme.look);
      this.update({ surface: init.context === null ? 'dashboard-widget' : 'property-action', connected: true, context: init.context, enabled: init.enabled !== false, synthetic: init.synthetic, ...(init.context === null ? { property: null, note: '', version: 0, stateReady: false, status: 'Widget ready. No record is selected.' } : {}) });
      await this.refresh();
    } catch (error) { if (!this.disposed) this.update({ status: explain(error), error: true }); }
  }
  setVisible(visible: boolean) {
    if (this.disposed || this.state.visible === visible) return;
    if (!visible) this.interrupt();
    this.update({ visible });
    if (visible && !this.state.stateReady) void this.refresh();
  }
  edit(note: string) {
    if (!this.allowed() || !this.state.stateReady || this.state.saving) return;
    this.update({ note, ...(note.length > 500 ? { status: messages['INVALID_NOTE'], error: true } : {}) });
  }
  async refresh() {
    if (!this.allowed() || !this.state.context || this.state.reading || this.state.saving) return;
    const epoch = this.generation, propertyId = this.state.context.id;
    this.update({ reading: true, status: 'Reading the selected property…', error: false });
    const tasks: Promise<void>[] = [this.request<PropertyContext>('property.read', { propertyId }).then(property => {
      if (epoch === this.generation && this.allowed()) this.update({ property });
    })];
    if (!this.state.stateReady) tasks.push(this.request<SavedNote>('appState.get', { propertyId }).then(saved => {
      if (epoch === this.generation && this.allowed()) this.update({ note: saved.note, version: saved.version, stateReady: true });
    }));
    const results = await Promise.allSettled(tasks);
    if (epoch !== this.generation || !this.allowed()) return;
    const failed = results.find(result => result.status === 'rejected');
    this.update({ reading: false, status: failed?.status === 'rejected' ? explain(failed.reason) : 'Property loaded.', error: !!failed });
  }
  cancelRead() { if (this.state.reading) { this.interrupt(); this.update({ status: 'Request cancelled.', error: false }); } }
  async save(actionId?: string) {
    if (!this.allowed() || !this.state.context || !this.state.stateReady || this.state.reading || this.state.saving) { if (actionId) this.client.completeAction(actionId, { success: false }); return; }
    if (this.state.note.length > 500) { this.update({ status: messages['INVALID_NOTE'], error: true }); if (actionId) this.client.completeAction(actionId, { success: false }); return; }
    const epoch = this.generation;
    const params = { propertyId: this.state.context.id, note: this.state.note, version: this.state.version };
    let success = false;
    this.update({ saving: true, status: 'Saving this app’s note…', error: false });
    try {
      const saved = await this.request<SavedNote>('appState.set', params);
      if (epoch === this.generation && this.allowed()) { this.update({ version: saved.version, note: saved.note, status: 'Note saved.', error: false }); success = true; }
    } catch (error) { if (epoch === this.generation && this.allowed()) this.update({ status: explain(error), error: true }); }
    finally {
      if (epoch === this.generation && !this.disposed) {
        this.update({ saving: false });
        if (actionId && this.allowed()) this.client.completeAction(actionId, { success });
      }
    }
  }
  destroy() {
    if (this.disposed) return;
    this.interrupt(); this.disposed = true;
    for (const dispose of this.removeListeners) dispose();
    this.removeListeners = []; this.client.destroy();
  }
}
