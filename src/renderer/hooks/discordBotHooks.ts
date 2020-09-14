import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';
import { BotContext, VoiceChannelInfo } from '../contexts/BotContext';
import { useContext, useEffect } from 'react';
import { WebContentsContext } from '../contexts/WebContentsContext';

export function useVoiceChannelsInServer(serverId: string): VoiceChannelInfo[] {
  const { isReady } = useContext(WebContentsContext);
  const { isLoggedIn } = useContext(BotContext);
  const [voiceChannels, setVoiceChannels] = useStateMemoArray<
    VoiceChannelInfo,
    string
  >([], (info) => info.id);
  useEffect(() => {
    if (isReady && isLoggedIn) {
      ipcRenderer
        .invoke('get-voice-channels', serverId)
        .then((voiceChannels) => {
          setVoiceChannels(voiceChannels);
        });
    }
  }, [isReady, isLoggedIn]);
  return voiceChannels;
}
