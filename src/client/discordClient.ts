import { Client, Guild, VoiceChannel } from 'discord.js';
import { BotWrapper } from './botWrapper';
import {
  ClientListener,
  MainProcessMessenger,
  ServerInfo,
  VoiceChannelInfo,
} from '../messages';

// utility functions for returning the correct data type
function toVoiceChannelInfo(channel: VoiceChannel): VoiceChannelInfo {
  return {
    id: channel.id,
    name: channel.name,
    serverId: channel.guild.id,
  };
}

function toServerInfo(server: Guild): ServerInfo {
  return {
    id: server.id,
    name: server.name,
  };
}

async function initialize() {
  const listener = new ClientListener(process);
  const messenger = new MainProcessMessenger(process);
  const client = new Client();

  client.on('ready', () => {
    const bot = new BotWrapper(client);
    messenger.send({ type: 'clientLoggedIn' });

    listener.addListener(async (msg) => {
      if (msg.type === 'mainGetAvatar') {
        const avatarUrl = bot.getAvatarUrl();
        if (avatarUrl) {
          messenger.send({ type: 'clientSendAvatar', url: avatarUrl });
        }
      }
      if (msg.type === 'mainGetName') {
        const name = bot.name;
        if (name) {
          messenger.send({ type: 'clientSendName', name });
        }
      }
      if (msg.type === 'mainGetJoinedServers') {
        const servers = bot.getJoinedServers().map(toServerInfo);

        messenger.send({ type: 'clientSendJoinedServers', servers });
      }
      if (msg.type === 'mainGetActiveVoiceChannels') {
        const voiceChannels = bot
          .getActiveVoiceChannels()
          .map(toVoiceChannelInfo);
        messenger.send({
          type: 'clientSendActiveVoiceChannels',
          voiceChannels,
        });
      }
      if (msg.type === 'mainGetChannelsInServer') {
        const server = bot
          .getJoinedServers()
          .find((server) => server.id === msg.server.id);
        if (server) {
          const voiceChannels = bot
            .getVoiceChannelsInServer(server)
            .map(toVoiceChannelInfo);
          messenger.send({ type: 'clientSendChannelsInServer', voiceChannels });
        }
      }
      if (msg.type === 'mainJoinChannel') {
        const server = bot
          .getJoinedServers()
          .find((server) => server.id === msg.voiceChannel.serverId);
        if (!server) {
          return;
        }
        const channel = bot
          .getVoiceChannelsInServer(server)
          .find((channel) => channel.id === msg.voiceChannel.id);

        if (!channel) {
          return;
        }
        await bot.join(channel);
        messenger.send({
          type: 'clientSendActiveVoiceChannels',
          voiceChannels: bot.getActiveVoiceChannels().map(toVoiceChannelInfo),
        });
      }
      if (msg.type === 'mainLeaveChannel') {
        const channel = bot
          .getActiveVoiceChannels()
          .find((channel) => channel.id === msg.voiceChannel.id);
        if (channel) {
          bot.leave(channel);
        }
        messenger.send({
          type: 'clientSendActiveVoiceChannels',
          voiceChannels: bot.getActiveVoiceChannels().map(toVoiceChannelInfo),
        });
      }
    });
  });

  // this is the only one we use at the top-level.
  // all other messages should be left inside the
  // client.on('ready') handler
  listener.addListener((msg) => {
    if (msg.type === 'mainSendToken') {
      client.login(msg.token);
    }
  });

  messenger.send({ type: 'clientReady' });
}

initialize();
