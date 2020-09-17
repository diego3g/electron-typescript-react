/**
 * This is sort of a catch-all file for initializing and
 * maintaining our different listeners.
 */
import { IpcRenderer, IpcMain, BrowserWindow } from 'electron';
import { ChildProcess } from 'child_process';

/**
 * 0. General-purpose types and constants
 */
const MESSAGE_CHANNEL = 'messageChannel';

interface BaseMessage {
  type: string;
}

export type ServerInfo = {
  id: string;
  name: string;
};

export type VoiceChannelInfo = {
  id: string;
  serverId: string;
  name: string;
};

export type DeviceInfo = {
  id: number;
  name: string;
};

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

interface BackendTokenMessage extends BaseMessage {
  type: 'backendSendToken';
  token: string;
}

interface BackendAvatarMessage extends BaseMessage {
  type: 'backendSendAvatar';
  url: string;
}

interface BackendNameMessage extends BaseMessage {
  type: 'backendSendName';
  name: string;
}

interface BackendJoinedServersMessage extends BaseMessage {
  type: 'backendSendJoinedServers';
  servers: ServerInfo[];
}

interface BackendActiveVoiceChannelsMessage extends BaseMessage {
  type: 'backendSendActiveVoiceChannels';
  voiceChannels: VoiceChannelInfo[];
}

interface BackendVoiceChannelsInServer extends BaseMessage {
  type: 'backendVoiceChannelsInServer';
  voiceChannels: VoiceChannelInfo[];
}

interface BackendSendDevices extends BaseMessage {
  type: 'backendSendDevices';
  devices: DeviceInfo[];
}

interface BackendDeviceSet extends BaseMessage {
  type: 'backendDeviceSet';
  device: DeviceInfo;
}

interface BackendSendSample extends BaseMessage {
  type: 'backendSendSample';
  sample: number;
}

export type RendererMessage =
  | BackendReadyMessage
  | BackendTokenMessage
  | BackendLoggedInMessage
  | BackendAvatarMessage
  | BackendNameMessage
  | BackendJoinedServersMessage
  | BackendActiveVoiceChannelsMessage
  | BackendVoiceChannelsInServer
  | BackendSendDevices
  | BackendDeviceSet
  | BackendSendSample;

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

interface ClientLoggedInMessage extends BaseMessage {
  type: 'clientLoggedIn';
}

interface ClientAvatarMessage extends BaseMessage {
  type: 'clientSendAvatar';
  url: string;
}

interface ClientNameMessage extends BaseMessage {
  type: 'clientSendName';
  name: string;
}

interface ClientJoinedServersMessage extends BaseMessage {
  type: 'clientSendJoinedServers';
  servers: ServerInfo[];
}

interface ClientActiveVoiceChannelsMessage extends BaseMessage {
  type: 'clientSendActiveVoiceChannels';
  voiceChannels: VoiceChannelInfo[];
}

interface ClientChannelsInServer extends BaseMessage {
  type: 'clientSendChannelsInServer';
  voiceChannels: VoiceChannelInfo[];
}

interface ClientSendDevices extends BaseMessage {
  type: 'clientSendDevices';
  devices: DeviceInfo[];
}

interface ClientDeviceSet extends BaseMessage {
  type: 'clientDeviceSet';
  device: DeviceInfo;
}

interface ClientSendSample extends BaseMessage {
  type: 'clientSendSample';
  sample: number;
}

interface RendererReadyMessage extends BaseMessage {
  type: 'rendererReady';
}

interface RendererTokenMessage extends BaseMessage {
  type: 'rendererGetToken';
}

interface RendererAvatarMessage extends BaseMessage {
  type: 'rendererGetAvatar';
}

interface RendererNameMessage extends BaseMessage {
  type: 'rendererGetName';
}

interface RendererJoinedServersMessage extends BaseMessage {
  type: 'rendererGetJoinedServers';
}

interface RendererActiveVoiceChannels extends BaseMessage {
  type: 'rendererGetActiveVoiceChannels';
}

interface RendererJoinChannel extends BaseMessage {
  type: 'rendererJoinChannel';
  voiceChannel: VoiceChannelInfo;
}

interface RendererLeaveChannel extends BaseMessage {
  type: 'rendererLeaveChannel';
  voiceChannel: VoiceChannelInfo;
}

interface RendererChannelsInServer extends BaseMessage {
  type: 'rendererGetVoiceChannelsInServer';
  server: ServerInfo;
}

interface RendererDevices extends BaseMessage {
  type: 'rendererGetDevices';
}

interface RendererSetDevice extends BaseMessage {
  type: 'rendererSetDevice';
  device: DeviceInfo;
}

interface RendererPlay extends BaseMessage {
  type: 'rendererPlay';
}

interface RendererStop extends BaseMessage {
  type: 'rendererStop';
}

interface RendererGetSample extends BaseMessage {
  type: 'rendererGetSample';
}

export type MainMessage =
  | ClientReadyMessage
  | ClientLoggedInMessage
  | ClientAvatarMessage
  | ClientNameMessage
  | ClientJoinedServersMessage
  | ClientActiveVoiceChannelsMessage
  | ClientChannelsInServer
  | ClientSendDevices
  | ClientDeviceSet
  | ClientSendSample
  | RendererReadyMessage
  | RendererTokenMessage
  | RendererAvatarMessage
  | RendererNameMessage
  | RendererJoinedServersMessage
  | RendererActiveVoiceChannels
  | RendererJoinChannel
  | RendererLeaveChannel
  | RendererChannelsInServer
  | RendererDevices
  | RendererSetDevice
  | RendererPlay
  | RendererStop
  | RendererGetSample;

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
interface MainSendToken extends BaseMessage {
  type: 'mainSendToken';
  token: string;
}

interface MainAvaterMessage extends BaseMessage {
  type: 'mainGetAvatar';
}

interface MainNameMessage extends BaseMessage {
  type: 'mainGetName';
}

interface MainJoinedServerMessage extends BaseMessage {
  type: 'mainGetJoinedServers';
}

interface MainActiveVoiceChannelsMessage extends BaseMessage {
  type: 'mainGetActiveVoiceChannels';
}

interface MainJoinChannel extends BaseMessage {
  type: 'mainJoinChannel';
  voiceChannel: VoiceChannelInfo;
}

interface MainLeaveChannel extends BaseMessage {
  type: 'mainLeaveChannel';
  voiceChannel: VoiceChannelInfo;
}

interface MainChannelsInServer extends BaseMessage {
  type: 'mainGetChannelsInServer';
  server: ServerInfo;
}

interface MainDevice extends BaseMessage {
  type: 'mainGetDevices';
}

interface MainSetDevice extends BaseMessage {
  type: 'mainSetDevice';
  device: DeviceInfo;
}

interface MainPlay extends BaseMessage {
  type: 'mainPlay';
}

interface MainStop extends BaseMessage {
  type: 'mainStop';
}

interface MainShutdown extends BaseMessage {
  type: 'mainShutdown';
}

interface MainGetSample extends BaseMessage {
  type: 'mainGetSample';
}

export type ClientMessage =
  | MainSendToken
  | MainAvaterMessage
  | MainNameMessage
  | MainJoinedServerMessage
  | MainActiveVoiceChannelsMessage
  | MainJoinChannel
  | MainLeaveChannel
  | MainChannelsInServer
  | MainDevice
  | MainSetDevice
  | MainPlay
  | MainStop
  | MainShutdown
  | MainGetSample;

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
