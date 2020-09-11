/**
 * This context collects mostly static bot info
 * (avatar URL, active channels, things that are
 * reflective of the bot and its state). Things
 * for fetching secondary info from Discord (i.e.
 * the channels in a server) are a little more
 * volatile and should be handled in a seprate context
 * or through hooks.
 */
import { ipcRenderer } from 'electron';
import React, { createContext, useState, useEffect } from 'react';

export type ServerInfo = {
  name: string;
  id: string;
};

export type VoiceChannelInfo = {
  name: string;
  id: string;
  serverId: string;
};

type ContextType = {
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  avatarUrl: string;
  name: string;
  servers: ServerInfo[];
  activeChannels: VoiceChannelInfo[];
  joinChannel: (channel: VoiceChannelInfo) => Promise<void>;
  leaveChannel: (channel: VoiceChannelInfo) => Promise<void>;
  token: string;
};

export const BotContext = createContext<ContextType>({
  isLoggedIn: false,
  login() {
    console.log('login() not instantiated yet');
    return Promise.resolve();
  },
  avatarUrl: '',
  name: '',
  servers: [],
  activeChannels: [],
  joinChannel() {
    console.log('joinChannel() not instantiated yet');
    return Promise.resolve();
  },
  leaveChannel() {
    console.log('leaveChannel() not instantiated yet');
    return Promise.resolve();
  },
  token: '',
});

export const BotProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeChannels, setActiveChannels] = useState<VoiceChannelInfo[]>([]);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    Promise.all([
      ipcRenderer.invoke('get-bot-url'),
      ipcRenderer.invoke('get-bot-name'),
      ipcRenderer.invoke('get-joined-servers'),
      ipcRenderer.invoke('get-active-voice-channels'),
      ipcRenderer.invoke('get-token'),
    ]).then(([url, name, servers, activeChannels, token]) => {
      setAvatarUrl(url);
      setName(name);
      setServers(servers);
      setActiveChannels(activeChannels);
      if (token) {
        setToken(token);
      }
    });
  }, [isLoggedIn]);

  async function login(token: string) {
    const didLogIn = await ipcRenderer.invoke('login', token);
    setIsLoggedIn(didLogIn);
  }

  async function joinChannel(channel: VoiceChannelInfo) {
    await ipcRenderer.invoke('join-channel', channel);
    const activeChannels = await ipcRenderer.invoke(
      'get-active-voice-channels'
    );
    setActiveChannels(activeChannels);
  }

  async function leaveChannel(channel: VoiceChannelInfo) {
    await ipcRenderer.invoke('leave-channel', channel);
    const activeChannels = await ipcRenderer.invoke(
      'get-active-voice-channels'
    );
    setActiveChannels(activeChannels);
  }

  const value = {
    isLoggedIn,
    login,
    avatarUrl,
    name,
    servers,
    joinChannel,
    leaveChannel,
    activeChannels,
    token,
  };

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};
