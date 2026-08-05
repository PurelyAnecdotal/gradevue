// https://github.com/mswjs/examples/blob/main/examples/with-svelte/src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
