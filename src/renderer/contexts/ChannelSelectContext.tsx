/**
 * This is a context which manages state for the
 * ChannelSelect component
 */
import React, { createContext, useState } from 'react';
import { useVoiceChannelsInServer } from '../hooks/discordBotHooks';
import { ServerInfo, VoiceChannelInfo } from './BotContext';

type ChannelSelectContextType = {
  currentServer: ServerInfo | null;
  setCurrentServer: (server: ServerInfo | null) => void;
  voiceChannels: VoiceChannelInfo[];
};

const initialState: ChannelSelectContextType = {
  currentServer: null,
  setCurrentServer() {
    console.log("setCurrentServer() hasn't been initialized yet");
  },
  voiceChannels: [],
};

export const ChannelSelectContext = createContext<ChannelSelectContextType>(
  initialState
);

export const ChannelSelectProvider: React.FC = ({ children }) => {
  const [currentServer, setCurrentServer] = useState<ServerInfo | null>(null);
  const voiceChannels = useVoiceChannelsInServer(currentServer);

  const value = {
    currentServer,
    setCurrentServer,
    voiceChannels,
  };

  return (
    <ChannelSelectContext.Provider value={value}>
      {children}
    </ChannelSelectContext.Provider>
  );
};
