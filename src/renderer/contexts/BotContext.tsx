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
  joinChannel: (channel: VoiceChannelInfo) => void;
  leaveChannel: (channel: VoiceChannelInfo) => void;
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
  },
  leaveChannel() {
    console.log('leaveChannel() not instantiated yet');
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
        if (msg.type === 'backendSendToken') {
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

  /**
   * Once the bot is ready and logged in, we can start
   * requesting data from it
   */
  useEffect(() => {
    if (isReady && isLoggedIn && mainMessenger && rendererListener) {
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'backendSendAvatar') {
          setAvatarUrl(msg.url);
        }
        if (msg.type === 'backendSendName') {
          setName(msg.name);
        }
        if (msg.type === 'backendSendJoinedServers') {
          setServers(msg.servers);
        }
        if (msg.type === 'backendSendActiveVoiceChannels') {
          setActiveChannels(msg.voiceChannels);
        }
      };
      rendererListener.addListener(listen);
      mainMessenger.send({ type: 'rendererGetAvatar' });
      mainMessenger.send({ type: 'rendererGetName' });
      mainMessenger.send({ type: 'rendererGetJoinedServers' });
      mainMessenger.send({ type: 'rendererGetActiveVoiceChannels' });

      return () => {
        rendererListener.removeListener(listen);
      };
    }
  }, [isLoggedIn, isReady, mainMessenger, rendererListener]);

  async function login(token: string) {
    // const didLogIn = await ipcRenderer.invoke('login', token);
    // setIsLoggedIn(didLogIn);
  }

  function joinChannel(channel: VoiceChannelInfo) {
    mainMessenger?.send({ type: 'rendererJoinChannel', voiceChannel: channel });
  }

  function leaveChannel(channel: VoiceChannelInfo) {
    mainMessenger?.send({
      type: 'rendererLeaveChannel',
      voiceChannel: channel,
    });
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
