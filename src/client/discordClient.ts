/**
 * This client is meant to be run as a forked subprocess of
 * the main Discord process. It acts as an interface to the
 * BotWrapper and responds to messages sent to it from "process"
 * 
 * @TODO might change this to use XPC on MacOS in the future
 * https://github.com/jongear/xpc-connect
 * https://developer.apple.com/documentation/xpc/xpc_services_connection_h
 */
import { Client, Guild, VoiceBroadcast, VoiceChannel } from 'discord.js';
import { BotWrapper } from './botWrapper';
import {
  ClientListener,
  DeviceInfo,
  MainProcessMessenger,
  ServerInfo,
  VoiceChannelInfo,
} from '../messages';
import { Device, getDevices } from 'naudiodon';
import {
  createAudioDevice,
  createDeviceBroadcast,
} from './deviceBroadcastStream';

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

function toDeviceInfo(device: Device): DeviceInfo {
  return {
    id: device.id,
    name: device.name,
  };
}

async function initialize() {
  const listener = new ClientListener(process);
  const messenger = new MainProcessMessenger(process);
  const client = new Client();

  client.on('ready', () => {
    const bot = new BotWrapper(client);
    let deviceStream: ReturnType<typeof createAudioDevice> | null = null;
    let broadcastStream: ReturnType<typeof createDeviceBroadcast> | null = null;
    let currentSample = 0;

    messenger.send({ type: 'clientLoggedIn' });

    process.on('SIGINT', () => {
      bot.getActiveVoiceChannels().forEach((channel) => {
        bot.leave(channel);
      });
      broadcastStream?.end();
      deviceStream?.quit();
    });

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
      if (msg.type === 'mainGetDevices') {
        messenger.send({
          type: 'clientSendDevices',
          devices: getDevices().map(toDeviceInfo),
        });
      }
      if (msg.type === 'mainSetDevice') {
        const device = getDevices().find(
          (device) => device.id === msg.device.id
        );
        if (device) {
          deviceStream = createAudioDevice(device);
          /**
           * Before we connect our audio device to the broadcast
           * stream, create a "data" listener that sends a sample of
           * audio data to the frontend. We'll use this for visualizations
           * that will let the user know the bot is listening
           */
          deviceStream.on('data', (buf: Buffer) => {
            currentSample = buf.toJSON().data[0];
          });
          broadcastStream = createDeviceBroadcast(client, deviceStream);
          messenger.send({
            type: 'clientDeviceSet',
            device: toDeviceInfo(device),
          });
        }
      }
      if (msg.type === 'mainPlay') {
        if (broadcastStream) {
          bot.getActiveVoiceChannels().forEach(async (channel) => {
            await bot.play(channel, broadcastStream as VoiceBroadcast);
          });
        }
      }
      if (msg.type === 'mainStop') {
        bot.getActiveVoiceChannels().forEach((channel) => {
          bot.silence(channel);
        });
      }
      if (msg.type === 'mainShutdown') {
        bot.getActiveVoiceChannels().forEach((channel) => {
          bot.leave(channel);
        });
        broadcastStream?.end();
        deviceStream?.quit();
      }
      if (msg.type === 'mainGetSample') {
        messenger.send({ type: 'clientSendSample', sample: currentSample });
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
