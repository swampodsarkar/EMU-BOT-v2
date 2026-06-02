export function isDevToolsOpen(): boolean {
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth > threshold;
  const heightDiff = window.outerHeight - window.innerHeight > threshold;
  return widthDiff || heightDiff;
}

export function initAntiDebugger() {
  setInterval(() => {
    if (isDevToolsOpen()) {
      document.title = '⚠️ EMU Bot - Protected';
    }
  }, 1000);

  const element = new Image();
  Object.defineProperty(element, 'id', {
    get() {
      throw new Error('DevTools detected');
    }
  });

  const checkDate = () => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      document.body.style.opacity = '0';
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:red;font-size:24px;font-family:monospace">UNAUTHORIZED ACCESS DETECTED</div>';
    }
  };

  setInterval(checkDate, 2000);

  const originalToString = Function.prototype.toString;
  Function.prototype.toString = function() {
    if (this.name === 'checkDate' || this.name === 'isDevToolsOpen') {
      return 'function() { [native code] }';
    }
    return originalToString.apply(this, arguments);
  };
}

export function protectLocalStorage() {
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function(key: string, value: string) {
    const event = new CustomEvent('storage-protect', { detail: { key, value } });
    window.dispatchEvent(event);
    return originalSetItem.call(this, key, value);
  };

  Storage.prototype.removeItem = function(key: string) {
    const event = new CustomEvent('storage-protect', { detail: { key } });
    window.dispatchEvent(event);
    return originalRemoveItem.call(this, key);
  };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function blockDragDrop() {
  document.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  document.addEventListener('drop', (e) => e.preventDefault());
  document.addEventListener('dragover', (e) => e.preventDefault());
}

export function initSecurity() {
  if (typeof window === 'undefined') return;

  protectLocalStorage();
  blockDragDrop();

  if (import.meta.env.PROD) {
    initAntiDebugger();
  }
}
