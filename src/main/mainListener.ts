/**
 * This defines an Inter-Process Communication (IPC)
 * listener for interacting with the Discord bot. We
 * need this to listen for requests for information from
 * the frontend, since we can't use all the features of
 * the Discord API directly there.
 *
 * @TODO We may want to work on expanding this eventually
 * to cover more than just "bot" messages
 *
 * @TODO Once the user's started a device stream, I can't
 * seem to exit this process without causing a segfault.
 * I'm not sure why this is. It might just be because electron
 * is buggy with these packages? If that's the case, maybe the
 * solution is to run it from a child process? Would that defeat
 * the purpose of running this in electron to begin with?
 * ~reccanti 9/7/2020
 */

import { App, ipcMain } from 'electron';
import path from 'path';
import { getToken, setToken } from './credentials';
import { spawn, fork } from 'child_process';
import { Client, VoiceBroadcast } from 'discord.js';
import fs from 'fs';
import { BotWrapper } from '../client/botWrapper';
import portAudio, { ReadableAudioStream } from 'naudiodon';
import {
  createAudioDevice,
  createDeviceBroadcast,
} from '../client/deviceBroadcastStream';
import { ClientMessenger, RendererMessenger, MainListener } from '../messages';

type VoiceChannelInfo = {
  id: string;
  serverId: string;
  name: string;
};

type DeviceInfo = {
  id: number;
  name: string;
};

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
  app.on('browser-window-created', (_e, browserWindow) => {
    const rendererMessenger = new RendererMessenger(browserWindow);
    const listener = new MainListener(ipcMain, clientProcess);

    getToken().then(async (token) => {
      if (token) {
        clientMessenger.send({ type: 'sendTokenMessage', token });
      }
    });

    listener.addListener((msg) => {
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
    });
  });

  clientProcess.stdout?.on('data', (data) => {
    console.log(data.toString());
  });

  process.on('SIGINT', () => {
    console.log('exiting...');
    app.exit();
  });

  ipcMain.handle('get-bot-url', () => {
    console.log('requesting url...');
    clientProcess.send({ type: 'getAvatar' });
    // return Promise.resolve(bot.getAvatarUrl());
  });

  cb();

  /**
   * Initialize the Discord client and bot wrapper
   */
  // const client = new Client();
  // function login(token: string) {
  //   return client
  //     .login(token)
  //     .then(() => true)
  //     .catch((err) => {
  //       console.log('unable to log into application');
  //       console.log(err);
  //       return false;
  //     });
  // }
  // getToken().then(async (token) => {
  //   if (token) {
  //     await login(token);
  //   }
  //   cb();
  // });
  // client.on('ready', () => {
  //   const bot = new BotWrapper(client);
  //   /**
  //    * @TODO This is mutable data that needs to be available for
  //    * all of these handlers. It feels kind of gross and brittle,
  //    * but I'm not sure of a better way to handle this at the moment
  //    *
  //    * ~reccanti 9/7/2020
  //    */
  //   let broadcastStream: VoiceBroadcast | null = null;
  //   let deviceStream: ReadableAudioStream | null = null;
  //   let currentSample = 0;
  //   function cleanupStreams(): Promise<void> {
  //     return new Promise((resolve) => {
  //       if (broadcastStream) {
  //         broadcastStream.end();
  //         broadcastStream = null;
  //       }
  //       if (deviceStream) {
  //         deviceStream.quit(() => {
  //           deviceStream = null;
  //           resolve();
  //         });
  //       }
  //     });
  //   }
  //   ipcMain.handle('get-joined-servers', () =>
  //     Promise.resolve(
  //       bot
  //         .getJoinedServers()
  //         .map((server) => ({ id: server.id, name: server.name }))
  //     )
  //   );
  //   ipcMain.handle('get-voice-channels', (_e, serverId: string) => {
  //     const server = bot
  //       .getJoinedServers()
  //       .find((server) => server.id === serverId);
  //     const channels = server
  //       ? bot.getVoiceChannelsInServer(server).map((channel) => ({
  //           id: channel.id,
  //           name: channel.name,
  //           serverId: channel.guild.id,
  //         }))
  //       : [];
  //     return Promise.resolve(channels);
  //   });
  //   ipcMain.handle('get-active-voice-channels', () =>
  //     Promise.resolve(
  //       bot.getActiveVoiceChannels().map((channel) => ({
  //         id: channel.id,
  //         name: channel.name,
  //         serverId: channel.guild.id,
  //       }))
  //     )
  //   );
  //   ipcMain.handle(
  //     'join-channel',
  //     async (_e, channelInfo: VoiceChannelInfo) => {
  //       const server = bot
  //         .getJoinedServers()
  //         .find((server) => server.id === channelInfo.serverId);
  //       if (!server) return;
  //       const channel = bot
  //         .getVoiceChannelsInServer(server)
  //         .find((channel) => channel.id === channelInfo.id);
  //       if (!channel) return;
  //       const loudredCry = fs.createReadStream(
  //         path.resolve(__dirname, '../../assets/loudred-cry.webm')
  //       );
  //       await bot.join(channel);
  //       if (broadcastStream) {
  //         await bot.play(channel, broadcastStream);
  //       } else {
  //         await bot.play(channel, loudredCry, { type: 'webm/opus' }, () => {
  //           bot.silence(channel);
  //         });
  //       }
  //       return Promise.resolve();
  //     }
  //   );
  //   ipcMain.handle('leave-channel', (_e, channelInfo: VoiceChannelInfo) => {
  //     const channel = bot
  //       .getActiveVoiceChannels()
  //       .find((channel) => channel.id === channelInfo.id);
  //     if (!channel) return;
  //     bot.leave(channel);
  //     return Promise.resolve();
  //   });
  //   ipcMain.handle('get-devices', () => {
  //     const devices = portAudio
  //       .getDevices()
  //       .map((device) => ({ name: device.name, id: device.id }));
  //     return Promise.resolve(devices);
  //   });
  //   ipcMain.handle('start-broadcast', (_e, deviceInfo: DeviceInfo) => {
  //     const device = portAudio
  //       .getDevices()
  //       .find((device) => device.id === deviceInfo.id);
  //     if (device) {
  //       /**
  //        * Before we connect our audio device to the broadcast
  //        * stream, create a "data" listener that sends a sample of
  //        * audio data to the frontend. We'll use this for visualizations
  //        * that will let the user know the bot is listening
  //        */
  //       deviceStream = createAudioDevice(device);
  //       deviceStream.on('data', (buf: Buffer) => {
  //         currentSample = buf.toJSON().data[0];
  //       });
  //       broadcastStream = createDeviceBroadcast(client, deviceStream);
  //       bot.getActiveVoiceChannels().forEach((channel) => {
  //         // casting here because we just set broadcastStream as a value above
  //         bot.play(channel, broadcastStream as VoiceBroadcast);
  //       });
  //     }
  //   });
  //   ipcMain.handle('stop-broadcast', async () => {
  //     bot.getActiveVoiceChannels().forEach((channel) => {
  //       bot.silence(channel);
  //     });
  //     await cleanupStreams();
  //     console.log('streams stopped');
  //   });
  //   ipcMain.handle('get-sample', () => {
  //     return Promise.resolve(currentSample);
  //   });
  //   ipcMain.handle('get-bot-name', () => {
  //     return Promise.resolve(bot.name);
  //   });
  //   ipcMain.handle('get-bot-url', () => {
  //     return Promise.resolve(bot.getAvatarUrl());
  //   });
  //   app.on('before-quit', async (e) => {
  //     if (deviceStream || broadcastStream) {
  //       e.preventDefault();
  //       await cleanupStreams();
  //       app.quit();
  //     }
  //   });
  // });
  // ipcMain.handle('login', async (_e, token: string) => {
  //   await setToken(token);
  //   return await login(token);
  // });
  // ipcMain.handle('is-logged-in', () => {
  //   return Promise.resolve(!!client.user);
  // });
  // ipcMain.handle('get-token', async () => {
  //   return await getToken();
  // });
}

export function asyncSetupMainListener(app: App): Promise<void> {
  return new Promise((resolve) => {
    setupMainListener(app, resolve);
  });
}
