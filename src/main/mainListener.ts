/**
 * This is the listener on the main process of app.
 * It initializes the Discord Client and handles messaging
 * between it and the renderer. 
 * 
 * It's also responsible for getting and setting the
 * Discord Client Token 
 */

import { App, ipcMain } from 'electron';
import path from 'path';
import { getToken, setToken } from './credentials';
import { fork } from 'child_process';
import { ClientMessenger, RendererMessenger, MainListener } from '../messages';

export function setupMainListener(app: App, cb: () => void): void {
  const clientProcess = fork(
    path.resolve(__dirname, '../client/discordClient.js'),
    [],
    {
      stdio: ['ipc', 'pipe', 'pipe'],
    }
  );
  const clientMessenger = new ClientMessenger(clientProcess);

  /**
   * We're using these variables to track whether the client
   * has been intialized because there's kind of a race condition.
   * If the client finishes initialization before the renderer,
   * we'll tell the renderer it's ready after the renderer has been
   * initialized. Otherwise, we'll wait until the client is initialized
   * before telling the renderer it's ready.
   */
  let clientInitialized = false;
  let clientLoggedIn = false;
  let rendererInitialized = false;

  /**
   * @TODO Not sure if this is the best way to handle this.
   * Essentially what this is doing is waiting for a window
   * to be initialized so we can snag a reference to it and
   * start posting messages to it.
   *
   * A better way to do it might be to initialize the window
   * first, get it's reference, then pass that to this function.
   * But then we wouldn't have handler ready when the window is
   * initialized. It's kind of a chicken-and-egg problem
   * ~reccanti 9/12/2020
   */
  app.on('browser-window-created', async (_e, browserWindow) => {
    const rendererMessenger = new RendererMessenger(browserWindow);
    const listener = new MainListener(ipcMain, clientProcess);

    const token = await getToken();
    if (token) {
      clientMessenger.send({ type: 'mainSendToken', token });
    }

    process.on('SIGINT', () => {
      // clientMessenger.send({ type: 'mainShutdown' });
      console.log('sigint, quitting');
      clientMessenger.send({ type: 'mainShutdown' });
      app.exit();
    });

    app.on('quit', () => {
      // console.log('app quitting...');
      clientMessenger.send({ type: 'mainShutdown' });
    });

    listener.addListener((msg) => {
      // All of this is stuff that's sort of sequential and
      // hard to time properly, that's the reason we have
      // all of these flags. Maybe a better solution would be
      // to have some sort of state object that we pass
      // around. That would at least keep everything in-sync
      if (msg.type === 'rendererReady') {
        rendererInitialized = true;
        if (clientInitialized) {
          rendererMessenger.send({ type: 'backendReady' });
        }
      }
      if (msg.type === 'clientReady') {
        clientInitialized = true;
        if (rendererInitialized) {
          rendererMessenger.send({ type: 'backendReady' });
        }
      }
      if (msg.type === 'clientLoggedIn') {
        clientLoggedIn = true;
        if (rendererInitialized) {
          rendererMessenger.send({ type: 'backendLoggedIn' });
        }
      }
      if (msg.type === 'rendererGetToken') {
        if (token) {
          rendererMessenger.send({ type: 'backendSendToken', token });
        }
        if (clientLoggedIn) {
          rendererMessenger.send({ type: 'backendLoggedIn' });
        }
      }
      // This stuff should be a little more stable, since it
      // won't be requested until the frontend knows it's
      // logged in
      if (msg.type === 'rendererGetAvatar') {
        clientMessenger.send({ type: 'mainGetAvatar' });
      }
      if (msg.type === 'rendererGetName') {
        clientMessenger.send({ type: 'mainGetName' });
      }
      if (msg.type === 'rendererGetJoinedServers') {
        clientMessenger.send({ type: 'mainGetJoinedServers' });
      }
      if (msg.type === 'rendererGetActiveVoiceChannels') {
        clientMessenger.send({ type: 'mainGetActiveVoiceChannels' });
      }
      if (msg.type === 'rendererJoinChannel') {
        clientMessenger.send({
          type: 'mainJoinChannel',
          voiceChannel: msg.voiceChannel,
        });
      }
      if (msg.type === 'rendererLeaveChannel') {
        clientMessenger.send({
          type: 'mainLeaveChannel',
          voiceChannel: msg.voiceChannel,
        });
      }
      if (msg.type === 'rendererGetDevices') {
        clientMessenger.send({
          type: 'mainGetDevices',
        });
      }
      if (msg.type === 'rendererSetDevice') {
        clientMessenger.send({ type: 'mainSetDevice', device: msg.device });
      }
      if (msg.type === 'rendererPlay') {
        clientMessenger.send({ type: 'mainPlay' });
      }
      if (msg.type === 'rendererStop') {
        clientMessenger.send({ type: 'mainStop' });
      }
      if (msg.type === 'rendererGetSample') {
        clientMessenger.send({ type: 'mainGetSample' });
      }
      if (msg.type === 'clientSendAvatar') {
        rendererMessenger.send({ type: 'backendSendAvatar', url: msg.url });
      }
      if (msg.type === 'clientSendName') {
        rendererMessenger.send({ type: 'backendSendName', name: msg.name });
      }
      if (msg.type === 'clientSendJoinedServers') {
        rendererMessenger.send({
          type: 'backendSendJoinedServers',
          servers: msg.servers,
        });
      }
      if (msg.type === 'clientSendActiveVoiceChannels') {
        rendererMessenger.send({
          type: 'backendSendActiveVoiceChannels',
          voiceChannels: msg.voiceChannels,
        });
      }
      if (msg.type === 'rendererGetVoiceChannelsInServer') {
        clientMessenger.send({
          type: 'mainGetChannelsInServer',
          server: msg.server,
        });
      }
      if (msg.type === 'clientSendChannelsInServer') {
        rendererMessenger.send({
          type: 'backendVoiceChannelsInServer',
          voiceChannels: msg.voiceChannels,
        });
      }
      if (msg.type === 'clientSendDevices') {
        rendererMessenger.send({
          type: 'backendSendDevices',
          devices: msg.devices,
        });
      }
      if (msg.type === 'clientDeviceSet') {
        rendererMessenger.send({
          type: 'backendDeviceSet',
          device: msg.device,
        });
      }
      if (msg.type === 'clientSendSample') {
        rendererMessenger.send({
          type: 'backendSendSample',
          sample: msg.sample,
        });
      }
    });
  });

  clientProcess.stdout?.on('data', (data) => {
    console.log(data.toString());
  });

  cb();
}

export function asyncSetupMainListener(app: App): Promise<void> {
  return new Promise((resolve) => {
    setupMainListener(app, resolve);
  });
}
