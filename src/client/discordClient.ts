import { Client } from 'discord.js';
import { BotWrapper } from './botWrapper';
import { ClientListener, MainProcessMessenger } from '../messages';

interface BaseMessage {
  type: string;
}

interface LoginMessage extends BaseMessage {
  type: 'login';
  token: string;
}

interface GetAvatarMessage extends BaseMessage {
  type: 'getAvatar';
}

type Message = LoginMessage | GetAvatarMessage;

async function initialize() {
  const listener = new ClientListener(process);
  const messenger = new MainProcessMessenger(process);
  const client = new Client();

  client.on('ready', () => {
    const bot = new BotWrapper(client);
    messenger.send({ type: 'clientLoggedIn' });

    listener.addListener((msg) => {
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
        const servers = bot
          .getJoinedServers()
          .map((server) => ({ id: server.id, name: server.name }));

        messenger.send({ type: 'clientSendJoinedServers', servers });
      }
      if (msg.type === 'mainGetActiveVoiceChannels') {
        const voiceChannels = bot.getActiveVoiceChannels().map((channel) => ({
          id: channel.id,
          serverId: channel.guild.id,
          name: channel.name,
        }));
        messenger.send({
          type: 'clientSendActiveVoiceChannels',
          voiceChannels,
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
