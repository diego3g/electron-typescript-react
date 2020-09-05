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

import { Client } from 'discord.js';
import { ipcMain } from 'electron';
import { BotWrapper } from './botWrapper';

export function setupMainListener(cb: () => void): void {
  /**
   * Initialize the Discord client and bot wrapper
   */
  const client = new Client();

  client.on('ready', () => {
    const bot = new BotWrapper(client);

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
      (_e, channelInfo: { id: string; name: string; serverId: string }) => {
        console.log('joining channel: ' + channelInfo.id);

        const server = bot
          .getJoinedServers()
          .find((server) => server.id === channelInfo.serverId);
        if (!server) {
          return;
        }

        const channel = bot
          .getVoiceChannelsInServer(server)
          .find((channel) => channel.id === channelInfo.id);

        if (channel) {
          bot.join(channel);
        }
      }
    );

    cb();
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
}
