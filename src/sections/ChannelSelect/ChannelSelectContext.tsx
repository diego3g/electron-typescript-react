/**
 * This is a context which manages state for the
 * ChannelSelect component
 */
import React, { createContext, useState } from 'react';
import {
  ServerInfo,
  VoiceChannelInfo,
  useJoinedServers,
  useActiveVoiceChannels,
  useVoiceChannelsInServer,
  useBotAvatarUrl,
  useBotName,
} from '../../hooks/discordBotHooks';

type ChannelSelectContextType = {
  servers: ServerInfo[];
  currentServer: ServerInfo | null;
  setCurrentServer: (server: ServerInfo | null) => void;
  voiceChannels: VoiceChannelInfo[];
  activeVoiceChannels: VoiceChannelInfo[];
  joinChannel: (channel: VoiceChannelInfo) => void;
  leaveChannel: (channel: VoiceChannelInfo) => void;
  botName: string | null;
  botAvatarUrl: string | null;
};

const initialState: ChannelSelectContextType = {
  servers: [],
  currentServer: null,
  setCurrentServer() {
    console.log("setCurrentServer() hasn't been initialized yet");
  },
  voiceChannels: [],
  activeVoiceChannels: [],
  joinChannel() {
    console.log("joinChannel() hasn't been initialized yet");
  },
  leaveChannel() {
    console.log("leaveChannel() hasn't been initialized yet");
  },
  botName: null,
  botAvatarUrl: null,
};

export const ChannelSelectContext = createContext<ChannelSelectContextType>(
  initialState
);

export const ChannelSelectProvider: React.FC = ({ children }) => {
  const servers = useJoinedServers();
  const [currentServer, setCurrentServer] = useState<ServerInfo | null>(null);
  const voiceChannels = useVoiceChannelsInServer(
    currentServer ? currentServer.id : ''
  );
  const {
    channels: activeVoiceChannels,
    joinChannel,
    leaveChannel,
  } = useActiveVoiceChannels();
  const botName = useBotName();
  const botAvatarUrl = useBotAvatarUrl();

  const value = {
    servers,
    currentServer,
    setCurrentServer,
    voiceChannels,
    activeVoiceChannels,
    joinChannel,
    leaveChannel,
    botName,
    botAvatarUrl,
  };

  return (
    <ChannelSelectContext.Provider value={value}>
      {children}
    </ChannelSelectContext.Provider>
  );
};
