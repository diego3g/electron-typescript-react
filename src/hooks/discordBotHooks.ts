import { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';

export type ServerInfo = {
  name: string;
  id: string;
};

export type VoiceChannelInfo = {
  name: string;
  id: string;
  serverId: string;
};

export function useJoinedServers(): ServerInfo[] {
  const [servers, setServers] = useStateMemoArray<ServerInfo, string>(
    [],
    (info) => info.id
  );
  ipcRenderer.invoke('get-joined-servers').then((servers) => {
    setServers(servers);
  });
  return servers;
}

export function useVoiceChannelsInServer(serverId: string): VoiceChannelInfo[] {
  const [voiceChannels, setVoiceChannels] = useStateMemoArray<
    VoiceChannelInfo,
    string
  >([], (info) => info.id);
  ipcRenderer.invoke('get-voice-channels', serverId).then((voiceChannels) => {
    setVoiceChannels(voiceChannels);
  });
  return voiceChannels;
}

export function useActiveVoiceChannels(): {
  channels: VoiceChannelInfo[];
  joinChannel: (channel: VoiceChannelInfo) => void;
  leaveChannel: (channel: VoiceChannelInfo) => void;
} {
  const [voiceChannels, setVoiceChannels] = useStateMemoArray<
    VoiceChannelInfo,
    string
  >([], (info) => info.id);

  function updateVoiceChannels() {
    ipcRenderer.invoke('get-active-voice-channels').then((voiceChannels) => {
      setVoiceChannels(voiceChannels);
    });
  }

  function joinChannel(channel: VoiceChannelInfo): void {
    ipcRenderer.invoke('join-channel', channel).then(updateVoiceChannels);
  }

  function leaveChannel(channel: VoiceChannelInfo): void {
    ipcRenderer.invoke('leave-channel', channel).then(updateVoiceChannels);
  }

  updateVoiceChannels();

  return {
    channels: voiceChannels,
    joinChannel,
    leaveChannel,
  };
}

export function useBotName() {
  const [botName, setBotName] = useState<string | null>(null);
  ipcRenderer.invoke('get-bot-name').then((name) => {
    if (name) {
      setBotName(name);
    } else {
      setBotName(null);
    }
  });
  return botName;
}

export function useBotAvatarUrl() {
  const [botAvatarUrl, setBotAvatarUrl] = useState<string | null>(null);
  ipcRenderer.invoke('get-bot-url').then((url) => {
    if (url) {
      setBotAvatarUrl(url);
    } else {
      setBotAvatarUrl(null);
    }
  });
  return botAvatarUrl;
}
