/// <reference types="vite/client" />

interface Document {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
}
