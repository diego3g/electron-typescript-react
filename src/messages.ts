/**
 * This is sort of a catch-all file for initializing and
 * maintaining our different listeners.
 */
import { IpcRenderer, IpcMain } from 'electron';

const MESSAGE_CHANNEL = 'messageChannel';

interface BaseMessage {
  type: string;
}

// 1. Renderer
interface BackendReadyMessage extends BaseMessage {
  type: 'backendReady';
}

export type RendererMessage = BackendReadyMessage;
export type RendererMessageCallback = (message: RendererMessage) => void;

export class RendererListener {
  private renderer: IpcRenderer;
  private callbacks = new Set<RendererMessageCallback>();

  constructor(renderer: IpcRenderer) {
    this.renderer = renderer;
    this.renderer.on(MESSAGE_CHANNEL, (_e, msg: RendererMessage) => {
      this.callbacks.forEach((cb) => {
        cb(msg);
      });
    });
  }

  addListener(cb: RendererMessageCallback) {
    this.callbacks.add(cb);
  }

  removeListener(cb: RendererMessageCallback) {
    this.callbacks.delete(cb);
  }
}

// 2. Main
// 3. Client
