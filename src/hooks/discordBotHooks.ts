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

export function useActiveVoiceChannels(): VoiceChannelInfo[] {
  const [voiceChannels, setVoiceChannels] = useStateMemoArray<
    VoiceChannelInfo,
    string
  >([], (info) => info.id);
  ipcRenderer.invoke('get-active-voice-channels').then((voiceChannels) => {
    setVoiceChannels(voiceChannels);
  });
  return voiceChannels;
}

export function join(channel: VoiceChannelInfo): void {
  ipcRenderer.invoke('join-channel', channel);
}

export function leave(channel: VoiceChannelInfo): void {
  ipcRenderer.invoke('leave-channel', channel);
}
