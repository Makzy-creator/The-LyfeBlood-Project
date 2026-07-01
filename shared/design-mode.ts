// Lightweight design-mode shim for local development
// Exports `initDesignMode` used by the web app. This provides a minimal
// implementation that avoids runtime import errors during development.

export type GetStyleInfo = (resolved: { element: Element }) => {
  className: string;
  styles: Record<string, string> | null;
};

export function initDesignMode(getStyleInfo: GetStyleInfo): () => void {
  // Minimal stub: expose a `reselect` function that does nothing.
  // Real implementations can be provided in a proper shared package.
  function reselect() {
    // noop — used after HMR updates to re-find the selected element
  }

  // Optionally attach to window for debugging
  if (typeof window !== 'undefined') {
    // @ts-ignore
    (window as any).__initDesignMode = { reselect };
  }

  return reselect;
}
