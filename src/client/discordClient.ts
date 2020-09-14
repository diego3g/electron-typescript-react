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
  });

  // this is the only one we use at the top-level.
  // all other messages should be left inside the
  // client.on('ready') handler
  listener.addListener((msg) => {
    if (msg.type === 'clientSendToken') {
      client.login(msg.token);
    }
  });

  messenger.send({ type: 'clientReady' });
}

initialize();
