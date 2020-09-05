import { useState } from 'react';
import { ipcRenderer } from 'electron';

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
  const [servers, setServers] = useState<ServerInfo[]>([]);

  // a list of IDs to check before we update our server list
  const serverLookup = new Set<string>();
  servers.forEach((server) => {
    serverLookup.add(server.id);
  });

  ipcRenderer.invoke('get-joined-servers').then((servers) => {
    for (const server of servers) {
      /**
       * @NOTE This is kind of gross. We only want to update
       * our list of servers if something has changed. However,
       * because we create new objects in the backend each time,
       * this will always be true, resulting in infinite rerenders.
       * Therefore, we add this check against the lookup table before
       * deciding to update our list of servers
       *
       * ~reccanti 9/5/2020
       */
      if (!serverLookup.has(server.id)) {
        setServers(servers);
        break;
      }
    }
  });

  return servers;
}

export function useVoiceChannelsInServer(serverId: string): VoiceChannelInfo[] {
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannelInfo[]>([]);

  const voiceChannelLookup = new Set<string>();
  voiceChannels.forEach((channel) => {
    voiceChannelLookup.add(channel.id);
  });

  ipcRenderer.invoke('get-voice-channels', serverId).then((voiceChannels) => {
    for (const channel of voiceChannels) {
      if (!voiceChannelLookup.has(channel.id)) {
        setVoiceChannels(voiceChannels);
        break;
      }
    }
  });
  return voiceChannels;
}

export function useActiveVoiceChannels(): VoiceChannelInfo[] {
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannelInfo[]>([]);

  const voiceChannelLookup = new Set<string>();
  voiceChannels.forEach((channel) => {
    voiceChannelLookup.add(channel.id);
  });

  ipcRenderer.invoke('get-active-voice-channels').then((voiceChannels) => {
    for (const channel of voiceChannels) {
      if (!voiceChannelLookup.has(channel.id)) {
        setVoiceChannels(voiceChannels);
        break;
      }
    }
  });
  return voiceChannels;
}

export function join(channel: VoiceChannelInfo): void {
  ipcRenderer.invoke('join-channel', channel);
}
