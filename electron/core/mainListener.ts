/**
 * This defines an Inter-Process Communication (IPC)
 * listener for interacting with the Discord bot. We
 * need this to listen for requests for information from
 * the frontend, since we can't use all the features of
 * the Discord API directly there.
 *
 * @TODO We may want to work on expanding this eventually
 * to cover more than just "bot" messages
 */

import { Client, VoiceBroadcast } from 'discord.js';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { BotWrapper } from './botWrapper';
import portAudio from 'naudiodon';
import {
  createAudioDevice,
  createDeviceBroadcast,
} from './deviceBroadcastStream';

type VoiceChannelInfo = {
  id: string;
  serverId: string;
  name: string;
};

type DeviceInfo = {
  id: number;
  name: string;
};

export function setupMainListener(cb: () => void): void {
  /**
   * Initialize the Discord client and bot wrapper
   */
  const client = new Client();

  client.on('ready', () => {
    const bot = new BotWrapper(client);
    /**
     * @TODO This is mutable data that needs to be available for
     * all of these handlers. It feels kind of gross and brittle,
     * but I'm not sure of a better way to handle this at the moment
     *
     * ~reccanti 9/7/2020
     */
    let broadcastStream: VoiceBroadcast | null = null;
    let currentSample = 0;

    ipcMain.handle('get-joined-servers', () =>
      Promise.resolve(
        bot
          .getJoinedServers()
          .map((server) => ({ id: server.id, name: server.name }))
      )
    );

    ipcMain.handle('get-voice-channels', (_e, serverId: string) => {
      const server = bot
        .getJoinedServers()
        .find((server) => server.id === serverId);
      const channels = server
        ? bot.getVoiceChannelsInServer(server).map((channel) => ({
            id: channel.id,
            name: channel.name,
            serverId: channel.guild.id,
          }))
        : [];
      return Promise.resolve(channels);
    });

    ipcMain.handle('get-active-voice-channels', () =>
      Promise.resolve(
        bot.getActiveVoiceChannels().map((channel) => ({
          id: channel.id,
          name: channel.name,
          serverId: channel.guild.id,
        }))
      )
    );

    ipcMain.handle(
      'join-channel',
      async (_e, channelInfo: VoiceChannelInfo) => {
        const server = bot
          .getJoinedServers()
          .find((server) => server.id === channelInfo.serverId);
        if (!server) return;

        const channel = bot
          .getVoiceChannelsInServer(server)
          .find((channel) => channel.id === channelInfo.id);
        if (!channel) return;

        const loudredCry = fs.createReadStream(
          path.resolve(__dirname, '../../assets/loudred-cry.webm')
        );
        await bot.join(channel);
        await bot.play(channel, loudredCry, { type: 'webm/opus' }, () => {
          bot.silence(channel);
        });
      }
    );

    ipcMain.handle('leave-channel', (_e, channelInfo: VoiceChannelInfo) => {
      const channel = bot
        .getActiveVoiceChannels()
        .find((channel) => channel.id === channelInfo.id);
      if (!channel) return;

      bot.leave(channel);
    });

    ipcMain.handle('get-devices', () => {
      const devices = portAudio
        .getDevices()
        .map((device) => ({ name: device.name, id: device.id }));
      return Promise.resolve(devices);
    });

    ipcMain.handle('start-broadcast', (_e, deviceInfo: DeviceInfo) => {
      const device = portAudio
        .getDevices()
        .find((device) => device.id === deviceInfo.id);
      if (device) {
        /**
         * Before we connect our audio device to the broadcast
         * stream, create a "data" listener that sends a sample of
         * audio data to the frontend. We'll use this for visualizations
         * that will let the user know the bot is listening
         */
        const deviceStream = createAudioDevice(device);
        deviceStream.on('data', (buf: Buffer) => {
          currentSample = buf.toJSON().data[0];
        });
        broadcastStream = createDeviceBroadcast(client, deviceStream);
        bot.getActiveVoiceChannels().forEach((channel) => {
          // casting here because we just set broadcastStream as a value above
          bot.play(channel, broadcastStream as VoiceBroadcast);
        });
      }
    });

    ipcMain.handle('stop-broadcast', () => {
      bot.getActiveVoiceChannels().forEach((channel) => {
        bot.silence(channel);
      });
    });

    ipcMain.handle('get-sample', () => {
      return Promise.resolve(currentSample);
    });

    cb();
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
}

export function asyncSetupMainListener(): Promise<void> {
  return new Promise((resolve) => {
    setupMainListener(resolve);
  });
}
