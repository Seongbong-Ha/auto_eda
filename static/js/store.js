export const state = {
  screen: "idle",       // 'idle' | 'ready' | 'analyzing' | 'done'
  file: null,           // File object or { name, size, fake: true }
  uploadResult: null,   // { filename, stats }
  report: null,         // { report_md }
  step: "upload",       // 'upload' | 'compute' | 'insights'
  error: null,
};

let listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(listener => listener(state));
}
