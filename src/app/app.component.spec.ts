import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppComponent, WELCOME_RUNTIME, welcomeName } from './app.component';

const mocks = {
  request: vi.fn(), connect: vi.fn(async () => ({ theme: { look: 'dark' } })),
  on: vi.fn(() => vi.fn()), destroy: vi.fn(), setLook: vi.fn(), dispose: vi.fn(),
  theme: vi.fn(), client: vi.fn(),
};
const runtime = { createPartnerClient: (...args: unknown[]) => {
  mocks.client(...args); return { request: mocks.request, connect: mocks.connect, on: mocks.on, destroy: mocks.destroy };
}, createThemeController: (...args: unknown[]) => {
  mocks.theme(...args); return { look: 'light', setLook: mocks.setLook, dispose: mocks.dispose };
} };

afterEach(() => { TestBed.resetTestingModule(); history.replaceState(null, '', '/'); vi.clearAllMocks(); });
async function render() {
  await TestBed.configureTestingModule({ imports: [AppComponent], providers: [{ provide: WELCOME_RUNTIME, useValue: runtime }] }).compileComponents();
  const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges(); await fixture.whenStable(); return fixture;
}
describe('first welcome app', () => {
  it('shows only a welcome panel and simple next steps without a chosen record or business app', async () => {
    const fixture = await render(), root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent).toBe('Welcome to Dezrez vibe coding');
    expect(root.querySelectorAll('.rezi-panel').length).toBe(1);
    expect(root.querySelector('header .char-book[aria-hidden="true"]')).not.toBeNull();
    expect(root.querySelectorAll('li').length).toBe(3);
    expect(root.querySelector('textarea, input, select, button, [data-partner-context]')).toBeNull();
    expect(root.textContent).not.toMatch(/property|reminder|note|agency|marketing role/i);
    expect(mocks.client).not.toHaveBeenCalled(); expect(mocks.request).not.toHaveBeenCalled();
    expect(mocks.theme).toHaveBeenCalledWith(expect.objectContaining({ fontSource: 'hosted', hostOwned: true }));
    fixture.destroy(); expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });
  it('renders the supplied first name as text and bounds optional display input', async () => {
    history.replaceState(null, '', '/?firstName=' + encodeURIComponent('<img src=x>'));
    const fixture = await render(), root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('h1')?.textContent).toBe('<img src=x>, welcome to Dezrez vibe coding');
    expect(root.querySelector('img')).toBeNull();
    expect(welcomeName('  Ian  ')).toBe('Ian'); expect(welcomeName('x'.repeat(61))).toBe('');
    expect(welcomeName('bad\nname')).toBe(''); expect(welcomeName(null)).toBe(''); fixture.destroy();
  });
  it('uses host appearance and lifecycle without requesting data', async () => {
    const previous = Object.getOwnPropertyDescriptor(window, 'parent');
    Object.defineProperty(window, 'parent', { configurable: true, value: {} });
    history.replaceState(null, '', '/?hostOrigin=https%3A%2F%2Fdevelopers.dezrez.com');
    try {
      const fixture = await render();
      expect(mocks.connect).toHaveBeenCalledTimes(1);
      expect(mocks.setLook).toHaveBeenCalledWith('dark', { persist: false });
      expect(mocks.request).not.toHaveBeenCalled(); fixture.destroy();
      expect(mocks.destroy).toHaveBeenCalledTimes(1); expect(mocks.dispose).toHaveBeenCalledTimes(1);
    } finally { if (previous) Object.defineProperty(window, 'parent', previous); }
  });
});
