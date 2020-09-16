import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';
import { BotContext, VoiceChannelInfo } from '../contexts/BotContext';
import { useContext, useEffect } from 'react';
import { WebContentsContext } from '../contexts/WebContentsContext';
import { ServerInfo, RendererMessage } from '../../messages';

export function useVoiceChannelsInServer(
  server: ServerInfo | null
): VoiceChannelInfo[] {
  const { isReady, rendererListener, mainMessenger } = useContext(
    WebContentsContext
  );
  const { isLoggedIn } = useContext(BotContext);
  const [voiceChannels, setVoiceChannels] = useStateMemoArray<
    VoiceChannelInfo,
    string
  >([], (info) => info.id);

  useEffect(() => {
    if (rendererListener && mainMessenger) {
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'backendVoiceChannelsInServer') {
          setVoiceChannels(msg.voiceChannels);
        }
      };
      rendererListener.addListener(listen);
      return () => {
        rendererListener.removeListener(listen);
      };
    }
  }, [rendererListener, mainMessenger]);

  useEffect(() => {
    if (isReady && isLoggedIn && server) {
      mainMessenger?.send({
        type: 'rendererGetVoiceChannelsInServer',
        server,
      });
    }
  }, [isReady, isLoggedIn, server]);
  return voiceChannels;
}
