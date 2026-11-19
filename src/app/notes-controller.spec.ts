import { describe, it, expect, vi } from 'vitest';
import { NotesController } from './notes-controller';
import type { GroupContext, InitialContext, PartnerClient, PropertyContext, SavedNote } from '../../public/sdk/client.js';

const property: PropertyContext = { id: 'test-1', agencyId: 'fictional-agency', address: '24 Orchard Lane', postcode: 'DE1 0MO', price: 385000, bedrooms: 3, description: 'Fictional' };
class FakeClient implements PartnerClient {
  sessionId = 'fixture-session'; listeners = new Map<string, (payload: any) => void>();
  connect = vi.fn(async (): Promise<InitialContext> => ({ context: property, enabled: true, synthetic: true, theme: { look: 'dark' } }));
  request = vi.fn(async (operation: string, params: any, options?: { signal?: AbortSignal }): Promise<PropertyContext | SavedNote> => {
    return operation === 'property.read' ? property : operation === 'appState.get' ? { note: 'Saved before', version: 2 } : { note: params.note, version: params.version + 1 };
  });
  on(type: string, listener: (payload: any) => void) { this.listeners.set(type, listener); return () => this.listeners.delete(type); }
  destroy = vi.fn();
  setActionState = vi.fn(() => true);
  completeAction = vi.fn(() => true);
  emit(type: string, payload: unknown) { this.listeners.get(type)?.(payload); }
}
async function ready() { const client = new FakeClient(); const theme = vi.fn(); const notes = new NotesController(client, () => {}, theme); await notes.connect(); return { client, notes, theme }; }
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
describe('real note controller with the SDK request boundary', () => {
  it('loads selected context and version, applies host theme and performs a versioned write', async () => {
    const { client, notes, theme } = await ready(); expect(theme).toHaveBeenCalledWith('dark'); expect(notes.state.note).toBe('Saved before');
    notes.edit('Updated'); await notes.save(); expect(client.request).toHaveBeenLastCalledWith('appState.set', { note: 'Updated', version: 2 }, expect.anything()); expect(notes.state.version).toBe(3);
  });
  it('accepts exactly 500 characters and blocks 501 without sending a write', async () => {
    const { client, notes } = await ready(); notes.edit('x'.repeat(500)); await notes.save(); expect(notes.state.version).toBe(3);
    const calls = client.request.mock.calls.length; notes.edit('x'.repeat(501)); await notes.save(); expect(client.request.mock.calls.length).toBe(calls); expect(notes.state.error).toBe(true);
  });
  it('preserves the draft and prior version on conflict without retrying a write', async () => {
    const { client, notes } = await ready(); client.request.mockRejectedValueOnce(Object.assign(Error(), { code: 'STATE_CONFLICT' }));
    notes.edit('My unsaved text'); const before = client.request.mock.calls.length; await notes.save(); expect(notes.state.note).toBe('My unsaved text'); expect(notes.state.version).toBe(2); expect(notes.state.status).toContain('Your text is still here'); expect(client.request.mock.calls.length).toBe(before + 1);
  });
  it('aborts outstanding work on pause, ignores a late reply and stops new operations', async () => {
    const { client, notes } = await ready(); let resolve!: (value: PropertyContext) => void;
    client.request.mockImplementationOnce(() => new Promise<PropertyContext>(done => { resolve = done; }));
    const read = notes.refresh(); const signal = client.request.mock.calls.at(-1)?.[2]?.signal; client.emit('enabled', { enabled: false });
    expect(signal?.aborted).toBe(true); const count = client.request.mock.calls.length; await notes.refresh(); await notes.save(); expect(client.request.mock.calls.length).toBe(count);
    resolve({ ...property, address: 'Stale response' }); await read; expect(notes.state.property?.address).toBe(property.address);
  });
  it('changes context safely, rejects stale reads and does not carry a note to another property', async () => {
    const { client, notes } = await ready(); let resolve!: (value: PropertyContext) => void;
    client.request.mockImplementationOnce(() => new Promise<PropertyContext>(done => { resolve = done; }));
    const old = notes.refresh(); client.emit('context', { ...property, id: 'test-2', address: 'Other property' }); await tick();
    resolve({ ...property, address: 'Old property late' }); await old; expect(notes.state.context?.id).toBe('test-2'); expect(notes.state.property?.address).not.toBe('Old property late');
    const calls = client.request.mock.calls.slice(-2); expect(calls.map(([operation]) => operation)).toEqual(['property.read', 'appState.get']); expect(calls[0]?.[1]).toEqual({ propertyId: 'test-2' }); expect(calls[1]?.[1]).toEqual({});
  });
  it('sends no background requests and aborts a read when hidden', async () => {
    const { client, notes } = await ready(); notes.setVisible(false); const count = client.request.mock.calls.length; await notes.refresh(); await notes.save(); expect(client.request.mock.calls.length).toBe(count);
    notes.setVisible(true); await notes.refresh(); expect(client.request.mock.calls.length).toBe(count + 1);
  });
  it('does not read during a hidden initial connection and loads once visible', async () => {
    const client = new FakeClient(), notes = new NotesController(client, () => {}, () => {}); notes.setVisible(false); await notes.connect(); expect(client.request).not.toHaveBeenCalled(); notes.setVisible(true); await tick(); expect(client.request).toHaveBeenCalledTimes(2);
  });
  it('does not read until an initially paused host enables the app', async () => {
    const client = new FakeClient(); client.connect.mockResolvedValueOnce({ context: property, enabled: false, synthetic: true, theme: { look: 'light' } });
    const notes = new NotesController(client, () => {}, () => {}); await notes.connect(); expect(client.request).not.toHaveBeenCalled(); client.emit('enabled', { enabled: true }); await tick(); expect(client.request).toHaveBeenCalledTimes(2);
  });
  it('stops on close and removes listeners/client on repeated disposal', async () => {
    const { client, notes } = await ready(); client.emit('closed', {}); const count = client.request.mock.calls.length; await notes.save(); await notes.refresh(); expect(client.request.mock.calls.length).toBe(count);
    notes.destroy(); notes.destroy(); expect(client.destroy).toHaveBeenCalledTimes(1); expect(client.listeners.size).toBe(0);
  });
  it('explains a throttled read without an automatic retry', async () => {
    const { client, notes } = await ready(); client.request.mockRejectedValueOnce(Object.assign(Error(), { code: 'RATE_LIMITED' })); const count = client.request.mock.calls.length;
    await notes.refresh(); expect(client.request.mock.calls.length).toBe(count + 1); expect(notes.state.status).toContain('Too many requests'); expect(notes.state.reading).toBe(false);
  });
  it('enables host action only when ready and completes its exact action after a successful save', async () => {
    const { client, notes } = await ready(); expect(client.setActionState).toHaveBeenLastCalledWith({ enabled: true });
    notes.edit('Host action note'); client.emit('action', { action: 'save', actionId: 'action-1' }); await tick();
    expect(client.completeAction).toHaveBeenCalledWith('action-1', { success: true }); expect(notes.state.version).toBe(3);
  });
  it('reports a failed host action without discarding the draft or claiming success', async () => {
    const { client, notes } = await ready(); notes.edit('Keep my text'); client.request.mockRejectedValueOnce(Object.assign(Error(), { code: 'STATE_CONFLICT' }));
    client.emit('action', { action: 'save', actionId: 'action-2' }); await tick();
    expect(client.completeAction).toHaveBeenCalledWith('action-2', { success: false }); expect(notes.state.note).toBe('Keep my text'); expect(notes.state.version).toBe(2);
  });
  it('accepts genuine no-record widget initialization without making property or note requests', async () => {
    const client = new FakeClient(); client.connect.mockResolvedValueOnce({ context: null, surface: 'dashboard-widget', enabled: true, synthetic: true, theme: { look: 'light' } });
    const notes = new NotesController(client, () => {}, () => {}); await notes.connect(); await notes.refresh(); await notes.save();
    expect(notes.state.surface).toBe('dashboard-widget'); expect(notes.state.context).toBeNull(); expect(notes.state.note).toBe(''); expect(notes.state.version).toBe(0); expect(client.request).not.toHaveBeenCalled();
  });
  it('clears drafts and aborts stale property work if it receives a null context', async () => {
    const { client, notes } = await ready(); notes.edit('Do not carry this draft'); let resolve!: (value: PropertyContext) => void;
    client.request.mockImplementationOnce(() => new Promise<PropertyContext>(done => { resolve = done; })); const reading = notes.refresh(); const signal = client.request.mock.calls.at(-1)?.[2]?.signal;
    client.emit('context', null); expect(signal?.aborted).toBe(true); resolve(property); await reading; await notes.save();
    expect(notes.state.context).toBeNull(); expect(notes.state.property).toBeNull(); expect(notes.state.note).toBe(''); expect(notes.state.version).toBe(0); expect(notes.state.stateReady).toBe(false);
    expect(client.request.mock.calls.at(-1)?.[0]).toBe('property.read');
  });
  it.each(['Couple', 'BusinessOrganisation', 'Team'])('uses %s group metadata and notes without a property read', async groupType => {
    const context: GroupContext = { kind: 'group', id: property.id, agencyId: property.agencyId, name: 'Fictional group', groupType };
    const client = new FakeClient(); client.connect.mockResolvedValueOnce({ context, surface: 'record-action', enabled: true, synthetic: true, theme: { look: 'light' } });
    const notes = new NotesController(client, () => {}, () => {}); await notes.connect();
    expect(notes.state.context).toEqual(context); expect(notes.state.property).toBeNull(); expect(notes.state.note).toBe('Saved before');
    expect(client.request).toHaveBeenCalledTimes(1); expect(client.request).toHaveBeenLastCalledWith('appState.get', {}, expect.anything());
    notes.edit('A group draft'); await notes.save(); expect(client.request).toHaveBeenLastCalledWith('appState.set', { note: 'A group draft', version: 2 }, expect.anything());
    expect(client.request.mock.calls.some(([operation]) => operation === 'property.read')).toBe(false);
  });
  it('offers one explicit retry for a failed group note load and enables Save only after the version is known', async () => {
    const client = new FakeClient(); client.connect.mockResolvedValueOnce({ context: { kind: 'group', id: 'group', agencyId: property.agencyId, name: 'Example team' }, surface: 'record-action', enabled: true, synthetic: true, theme: { look: 'light' } });
    client.request.mockRejectedValueOnce(Object.assign(Error(), { code: 'PERMISSION_DENIED' }));
    const notes = new NotesController(client, () => {}, () => {}); await notes.connect();
    expect(notes.state.noteLoadFailed).toBe(true); expect(notes.state.stateReady).toBe(false); expect(client.request).toHaveBeenCalledTimes(1); expect(client.setActionState).toHaveBeenLastCalledWith({ enabled: false });
    await notes.refresh(); expect(client.request).toHaveBeenCalledTimes(2); expect(notes.state.noteLoadFailed).toBe(false); expect(notes.state.stateReady).toBe(true);
  });
  it('rejects a late old-role Save completion when another marketing role of the same property is selected', async () => {
    const { client, notes } = await ready(); let resolve!: (value: SavedNote) => void;
    client.request.mockImplementationOnce(() => new Promise<SavedNote>(done => { resolve = done; }));
    notes.edit('Previous role draft'); const saving = notes.save('old-action');
    client.emit('context', { ...property, kind: 'property', marketingRole: { id: 'auction-role', type: 'Auction', status: 'Archived' } }); await tick();
    resolve({ note: 'Old write completed late', version: 99 }); await saving;
    expect(notes.state.context?.kind).toBe('property'); expect((notes.state.context as PropertyContext).marketingRole?.id).toBe('auction-role');
    expect(notes.state.note).toBe('Saved before'); expect(notes.state.version).toBe(2); expect(client.completeAction).not.toHaveBeenCalled();
  });
  it('requires explicit reload after a conflict without discarding the draft or repeating the write', async () => {
    const { client, notes } = await ready(); notes.edit('Keep my draft'); client.request.mockRejectedValueOnce(Object.assign(Error(), { code: 'STATE_CONFLICT' }));
    await notes.save(); expect(notes.state.note).toBe('Keep my draft'); expect(notes.state.noteLoadFailed).toBe(true); expect(notes.state.stateReady).toBe(false);
    const count = client.request.mock.calls.length; await notes.save(); expect(client.request.mock.calls.length).toBe(count);
    await notes.refresh(); expect(notes.state.note).toBe('Saved before'); expect(notes.state.stateReady).toBe(true);
    expect(client.request.mock.calls.filter(([operation]) => operation === 'appState.set')).toHaveLength(1);
  });
});
