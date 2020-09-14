/**
 * This is sort of a catch-all file for initializing and
 * maintaining our different listeners.
 */
import { IpcRenderer, IpcMain, BrowserWindow } from 'electron';
import { ChildProcess } from 'child_process';

const MESSAGE_CHANNEL = 'messageChannel';

interface BaseMessage {
  type: string;
}

export type MessageCallback<MessageType> = (message: MessageType) => void;

interface Listener<MessageType> {
  addListener: (cb: MessageCallback<MessageType>) => void;
  removeListener: (cb: MessageCallback<MessageType>) => void;
}

interface Messenger<MessageType> {
  send: (msg: MessageType) => void;
}

/**
 * 1. Renderer
 */
interface BackendReadyMessage extends BaseMessage {
  type: 'backendReady';
}

interface BackendLoggedInMessage extends BaseMessage {
  type: 'backendLoggedIn';
}

interface SendTokenRendererMessage extends BaseMessage {
  type: 'rendererSendToken';
  token: string;
}

export type RendererMessage =
  | BackendReadyMessage
  | SendTokenRendererMessage
  | BackendLoggedInMessage;

export class RendererMessenger implements Messenger<RendererMessage> {
  private browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  send(msg: RendererMessage) {
    this.browserWindow.webContents.send(MESSAGE_CHANNEL, msg);
  }
}

export class RendererListener implements Listener<RendererMessage> {
  private renderer: IpcRenderer;
  private callbacks = new Set<MessageCallback<RendererMessage>>();

  constructor(renderer: IpcRenderer) {
    this.renderer = renderer;
    this.renderer.on(MESSAGE_CHANNEL, (_e, msg: RendererMessage) => {
      this.callbacks.forEach((cb) => {
        cb(msg);
      });
    });
  }

  addListener(cb: MessageCallback<RendererMessage>) {
    this.callbacks.add(cb);
  }

  removeListener(cb: MessageCallback<RendererMessage>) {
    this.callbacks.delete(cb);
  }
}

/**
 * 2. Main
 */
interface ClientReadyMessage extends BaseMessage {
  type: 'clientReady';
}

interface RendererReadyMessage extends BaseMessage {
  type: 'rendererReady';
}

interface GetTokenMessage extends BaseMessage {
  type: 'rendererGetToken';
}

interface ClientLoggedInMessage extends BaseMessage {
  type: 'clientLoggedIn';
}

export type MainMessage =
  | ClientReadyMessage
  | ClientLoggedInMessage
  | RendererReadyMessage
  | GetTokenMessage;

export class IpcMainMessenger implements Messenger<MainMessage> {
  private renderer: IpcRenderer;

  constructor(renderer: IpcRenderer) {
    this.renderer = renderer;
  }

  send(msg: MainMessage) {
    this.renderer.send(MESSAGE_CHANNEL, msg);
  }
}

export class MainProcessMessenger implements Messenger<MainMessage> {
  private mainProcess: NodeJS.Process;

  constructor(mainProcess: NodeJS.Process) {
    this.mainProcess = mainProcess;
  }

  send(msg: MainMessage) {
    if (this.mainProcess.send) {
      this.mainProcess.send(msg);
    }
  }
}

export class MainListener implements Listener<MainMessage> {
  private main: IpcMain;
  private childProcess: ChildProcess;
  private callbacks = new Set<MessageCallback<MainMessage>>();

  constructor(main: IpcMain, childProcess: ChildProcess) {
    this.main = main;
    this.childProcess = childProcess;

    /**
     * @TODO it's probably not very efficient to loop through
     * this set of callbacks twice, but it helps consolidate
     * all the messages from each without having to create a
     * different listener for each location (client, renderer,
     * etc...)
     * ~reccanti 9/13/2020
     */
    this.main.on(MESSAGE_CHANNEL, (_e, msg: MainMessage) => {
      this.callbacks.forEach((cb) => {
        cb(msg);
      });
    });
    this.childProcess.on('message', (msg: MainMessage) => {
      this.callbacks.forEach((cb) => {
        cb(msg);
      });
    });
  }

  addListener(cb: MessageCallback<MainMessage>) {
    this.callbacks.add(cb);
  }

  removeListener(cb: MessageCallback<MainMessage>) {
    this.callbacks.delete(cb);
  }
}

/**
 * 3. Client
 */
interface SendTokenClientMessage extends BaseMessage {
  type: 'clientSendToken';
  token: string;
}

export type ClientMessage = SendTokenClientMessage;

export class ClientMessenger implements Messenger<ClientMessage> {
  private childProcess: ChildProcess;

  constructor(childProcess: ChildProcess) {
    this.childProcess = childProcess;
  }

  send(msg: ClientMessage) {
    this.childProcess.send(msg);
  }
}

export class ClientListener implements Listener<ClientMessage> {
  private mainProcess: NodeJS.Process;
  private callbacks = new Set<MessageCallback<ClientMessage>>();

  constructor(mainProcess: NodeJS.Process) {
    this.mainProcess = mainProcess;

    this.mainProcess.on('message', (msg: ClientMessage) => {
      this.callbacks.forEach((cb) => {
        cb(msg);
      });
    });
  }

  addListener(cb: MessageCallback<ClientMessage>) {
    this.callbacks.add(cb);
  }

  removeListener(cb: MessageCallback<ClientMessage>) {
    this.callbacks.delete(cb);
  }
}
