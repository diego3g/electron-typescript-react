import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';
import { VoiceChannelInfo } from '../contexts/BotContext';

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
