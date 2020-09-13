import { Message } from '@material-ui/icons';
import { Client } from 'discord.js';
import { BotWrapper } from './botWrapper';

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
  console.log('initializing!!!!');
  const client = new Client();
  //   const token = await getToken();
  //   if (token) {
  //     await login(client, token);
  //   }
  client.on('ready', () => {
    console.log('ready!!!');
    const bot = new BotWrapper(client);

    process.on('message', (msg: Message) => {
      if (msg.type === 'getAvatar') {
        console.log('sending back...');
        const url = bot.getAvatarUrl();
        if (process.send) {
          console.log('sending');
          process.send({ type: 'sendAvatar', url });
        }
      }
    });
  });

  // this is the only one we use at the top-level.
  // all other messages should be left inside the
  // client.on('ready') handler
  process.on('message', (msg: Message) => {
    if (msg.type === 'login') {
      client.login(msg.token);
    }
  });
}

initialize();
