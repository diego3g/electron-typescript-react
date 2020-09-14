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
import React, { createContext, useState, useEffect, useContext } from 'react';
import { render } from 'react-dom';
import { WebContentsContext } from './WebContentsContext';
import { RendererMessage } from '../../messages';

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
  const { isReady, rendererListener, mainMessenger } = useContext(
    WebContentsContext
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeChannels, setActiveChannels] = useState<VoiceChannelInfo[]>([]);
  const [token, setToken] = useState<string>('');

  /**
   * Used to see if the user is already logged into the application
   */
  useEffect(() => {
    if (isReady && mainMessenger && rendererListener) {
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'rendererSendToken') {
          setToken(msg.token);
        }
        if (msg.type === 'backendLoggedIn') {
          setIsLoggedIn(true);
        }
      };
      rendererListener.addListener(listen);
      mainMessenger.send({ type: 'rendererGetToken' });
      return () => {
        rendererListener.removeListener(listen);
      };
    }
  }, [isReady, mainMessenger, rendererListener]);

  useEffect(() => {
    // request data from the backend
    if (isReady && isLoggedIn && mainMessenger && rendererListener) {
      console.log('ready for logged in stuff!!!');
      // Promise.all([
      //   ipcRenderer.invoke('get-bot-url'),
      //   ipcRenderer.invoke('get-bot-name'),
      //   ipcRenderer.invoke('get-joined-servers'),
      //   ipcRenderer.invoke('get-active-voice-channels'),
      //   ipcRenderer.invoke('get-token'),
      // ]).then(([url, name, servers, activeChannels, token]) => {
      //   // setAvatarUrl(url);
      //   setName(name);
      //   setServers(servers);
      //   setActiveChannels(activeChannels);
      //   if (token) {
      //     setToken(token);
      //   }
      // });
      // // listen for responses from the backend
      // ipcRenderer.on('clientMessage', (_e, msg) => {
      //   if (msg.type === 'sendAvatar') {
      //     console.log('got url');
      //     setAvatarUrl(msg.url);
      //   }
      // });
    }
  }, [isLoggedIn, isReady, mainMessenger, rendererListener]);

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
