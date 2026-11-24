import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppComponent, WELCOME_RUNTIME } from './app.component';

const handlers = new Map<string, (value: unknown) => void>();
const order: string[] = [];
const mocks = {
  request: vi.fn(), connect: vi.fn(), viewerGet: vi.fn(),
  on: vi.fn(), destroy: vi.fn(), viewerDestroy: vi.fn(),
  setLook: vi.fn(), dispose: vi.fn(), theme: vi.fn(), client: vi.fn(), viewer: vi.fn(),
};
const runtime = {
  createPartnerClient: (...args: unknown[]) => {
    mocks.client(...args);
    return { request: mocks.request, connect: mocks.connect, on: mocks.on, destroy: mocks.destroy };
  },
  createViewerClient: (...args: unknown[]) => {
    order.push('viewer'); mocks.viewer(...args);
    return { getCurrentViewer: mocks.viewerGet, destroy: mocks.viewerDestroy };
  },
  createThemeController: (...args: unknown[]) => {
    mocks.theme(...args); return { look: 'light', setLook: mocks.setLook, dispose: mocks.dispose };
  },
};
const originalParent = Object.getOwnPropertyDescriptor(window, 'parent');
beforeEach(() => {
  vi.resetAllMocks(); handlers.clear(); order.length = 0;
  mocks.connect.mockImplementation(async () => { order.push('connect'); return { theme: { look: 'dark' } }; });
  mocks.viewerGet.mockImplementation(async () => { order.push('get'); return { firstName: 'Anne' }; });
  mocks.on.mockImplementation((event: string, handler: (value: unknown) => void) => { handlers.set(event, handler); return vi.fn(); });
  mocks.viewerDestroy.mockImplementation(() => { order.push('viewer-destroy'); });
  mocks.destroy.mockImplementation(() => { order.push('core-destroy'); });
});
afterEach(() => {
  TestBed.resetTestingModule(); history.replaceState(null, '', '/');
  if (originalParent) Object.defineProperty(window, 'parent', originalParent);
});
function pair(query = '') {
  Object.defineProperty(window, 'parent', { configurable: true, value: {} });
  history.replaceState(null, '', '/?hostOrigin=https%3A%2F%2Fdevelopers.dezrez.com' + query);
}
async function render() {
  await TestBed.configureTestingModule({ imports: [AppComponent], providers: [{ provide: WELCOME_RUNTIME, useValue: runtime }] }).compileComponents();
  const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
  await Promise.resolve(); await Promise.resolve(); fixture.detectChanges(); return fixture;
}
async function settle() { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); }
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

describe('signed-in first welcome app', () => {
  it('preserves both panels and three instructions without record features or a fabricated name', async () => {
    history.replaceState(null, '', '/?firstName=MadeUp');
    const fixture = await render(), root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent).toBe('Welcome to Dezrez vibe coding');
    expect(root.querySelectorAll('.rezi-panel').length).toBe(2);
    expect(root.querySelector('[aria-labelledby="welcome-heading"] header .char-code[aria-hidden="true"]')).not.toBeNull();
    expect(root.querySelector('p')?.textContent).toBe('Your starting app is ready. You decide what it becomes.');
    expect(root.querySelector('h2')?.textContent).toBe('What happens next');
    expect(root.querySelector('[aria-labelledby="next-heading"] header .char-book[aria-hidden="true"]')).not.toBeNull();
    expect([...root.querySelectorAll('li')].map(item => item.textContent)).toEqual([
      'Tell your AI what you would like to make.',
      'Ask for one small change at a time.',
      'Return to the developer website in Chrome or Edge to see your changes.',
    ]);
    expect(root.querySelector('textarea, input, select, button, [data-partner-context]')).toBeNull();
    expect(root.textContent).not.toMatch(/property|reminder|note|agency|marketing role|MadeUp/i);
    expect(root.querySelector('[role="status"]')?.textContent).toMatch(/Sign in.*reconnect/);
    expect(mocks.client).not.toHaveBeenCalled(); expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.theme).toHaveBeenCalledWith(expect.objectContaining({ fontSource: 'hosted', hostOwned: true }));
    fixture.destroy(); expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });

  it('uses only the authenticated viewer name after connecting, ignoring URL names', async () => {
    pair('&firstName=MadeUp'); mocks.viewerGet.mockResolvedValue({ firstName: '<img src=x>' });
    const fixture = await render(); await settle(); fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent).toBe('<img src=x> welcome to Dezrez vibe coding');
    expect(root.querySelector('img')).toBeNull(); expect(root.querySelector('[role="status"]')).toBeNull();
    expect(order.slice(0, 2)).toEqual(['viewer', 'connect']);
    expect(mocks.viewerGet).toHaveBeenCalledTimes(1);
    expect(mocks.setLook).toHaveBeenCalledWith('dark', { persist: false });
    expect(mocks.request).not.toHaveBeenCalled();
    handlers.get('partner.theme')?.({ look: 'light' });
    expect(mocks.setLook).toHaveBeenCalledWith('light', { persist: false }); fixture.destroy();
  });

  it('waits for core connection before asking for the current viewer', async () => {
    pair(); const connection = deferred<{ theme: { look: string } }>(); mocks.connect.mockReturnValue(connection.promise);
    const fixture = await render();
    expect(mocks.viewerGet).not.toHaveBeenCalled(); expect(fixture.componentInstance.firstName()).toBeNull();
    expect(fixture.componentInstance.statusMessage()).toMatch(/Loading/);
    connection.resolve({ theme: { look: 'dark' } }); await settle(); fixture.detectChanges();
    expect(mocks.viewerGet).toHaveBeenCalledTimes(1); expect(fixture.componentInstance.firstName()).toBe('Anne'); fixture.destroy();
  });

  it('shows a reconnect instruction for a missing or invalid API name without inventing one', async () => {
    for (const name of [null, '', ' ', 'x'.repeat(61), 'bad\nname', 'bad\u202ename']) {
      pair('&firstName=MadeUp'); mocks.viewerGet.mockResolvedValue({ firstName: name });
      const fixture = await render(); await settle(); fixture.detectChanges();
      expect(fixture.componentInstance.firstName()).toBeNull();
      expect(fixture.nativeElement.querySelector('h1')?.textContent).toBe('Welcome to Dezrez vibe coding');
      expect(fixture.componentInstance.statusMessage()).toMatch(/Sign in.*reconnect/);
      fixture.destroy(); TestBed.resetTestingModule();
    }
  });

  it('handles sign-in and connection failures without showing error internals', async () => {
    pair(); mocks.viewerGet.mockRejectedValue(new Error('private diagnostic'));
    const fixture = await render(); await settle(); fixture.detectChanges();
    expect(fixture.componentInstance.firstName()).toBeNull();
    expect(fixture.nativeElement.textContent).toMatch(/Sign in.*reconnect/);
    expect(fixture.nativeElement.textContent).not.toContain('private diagnostic'); fixture.destroy();
    TestBed.resetTestingModule(); mocks.connect.mockRejectedValue(new Error('private connect diagnostic'));
    const disconnected = await render(); await settle(); disconnected.detectChanges();
    expect(disconnected.componentInstance.statusMessage()).toMatch(/Sign in.*reconnect/);
    expect(disconnected.nativeElement.textContent).not.toContain('private connect diagnostic'); disconnected.destroy();
  });

  it('clears a loaded name when the host closes and destroys the viewer before core', async () => {
    pair(); const fixture = await render(); await settle(); fixture.detectChanges();
    expect(fixture.componentInstance.firstName()).toBe('Anne'); handlers.get('partner.closed')?.({});
    expect(fixture.componentInstance.firstName()).toBeNull();
    expect(order.slice(-2)).toEqual(['viewer-destroy', 'core-destroy']); fixture.destroy();
    expect(mocks.viewerDestroy).toHaveBeenCalledTimes(1); expect(mocks.destroy).toHaveBeenCalledTimes(1);
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });

  it('ignores a late viewer result after destruction', async () => {
    pair(); const response = deferred<{ firstName: string }>(); mocks.viewerGet.mockReturnValue(response.promise);
    const fixture = await render(); await settle(); expect(mocks.viewerGet).toHaveBeenCalledTimes(1);
    fixture.destroy(); response.resolve({ firstName: 'Previous user' }); await settle();
    expect(fixture.componentInstance.firstName()).toBeNull();
    expect(fixture.componentInstance.statusMessage()).toBe('This app connection has ended.');
    expect(order.slice(-2)).toEqual(['viewer-destroy', 'core-destroy']);
  });

  it('never requests a viewer if connection completes after destruction', async () => {
    pair(); const connection = deferred<{ theme: { look: string } }>(); mocks.connect.mockReturnValue(connection.promise);
    const fixture = await render(); fixture.destroy(); connection.resolve({ theme: { look: 'dark' } }); await settle();
    expect(mocks.viewerGet).not.toHaveBeenCalled(); expect(mocks.setLook).not.toHaveBeenCalled();
    expect(fixture.componentInstance.firstName()).toBeNull();
  });
});
