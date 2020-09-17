import React, { createContext, useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { BotContext } from './BotContext';
import { WebContentsContext } from './WebContentsContext';
import { RendererMessage } from '../../messages';
import { render } from 'react-dom';

const PING_INTERVAL = 500;

export type DeviceInfo = {
  id: number;
  name: string;
};

type ContextType = {
  devices: DeviceInfo[];
  sample: number;
  startBroadcast: (device: DeviceInfo) => void;
  stopBroadcast: () => void;
};

export const PortAudioContext = createContext<ContextType>({
  devices: [],
  sample: 0,
  startBroadcast() {
    console.log('"startBroadcast()" not implemented yet');
  },
  stopBroadcast() {
    console.log('"stopBroadcast()" not implemented yet');
  },
});

export const PortAudioProvider: React.FC = ({ children }) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [sample, setSample] = useState(0);
  const { isLoggedIn } = useContext(BotContext);
  const { isReady, rendererListener, mainMessenger } = useContext(
    WebContentsContext
  );

  useEffect(() => {
    if (isReady && isLoggedIn && rendererListener && mainMessenger) {
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'backendSendDevices') {
          setDevices(msg.devices);
        }
      };
      rendererListener.addListener(listen);
      mainMessenger.send({ type: 'rendererGetDevices' });
      return () => rendererListener?.removeListener(listen);
    }
  }, [isReady, isLoggedIn, rendererListener, mainMessenger]);

  useEffect(() => {
    if (isReady && isLoggedIn && mainMessenger && rendererListener) {
      // ping for new samples at a regular interval
      let prev = 0;
      const ping = async () => {
        requestAnimationFrame(async (cur) => {
          if (cur - prev > PING_INTERVAL) {
            prev = cur;
            mainMessenger.send({ type: 'rendererGetSample' });
          }
          ping();
        });
      };
      ping();

      // listen for responses from the server
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'backendSendSample') {
          setSample(msg.sample);
        }
      };
      rendererListener.addListener(listen);
      return () => rendererListener.removeListener(listen);
    }
  }, [isLoggedIn, isReady, rendererListener, mainMessenger]);

  const startBroadcast = (device: DeviceInfo) => {
    mainMessenger?.send({ type: 'rendererPlay' });
    // await ipcRenderer.invoke('start-broadcast', device);
  };

  const stopBroadcast = () => {
    mainMessenger?.send({ type: 'rendererStop' });
    // await ipcRenderer.invoke('stop-broadcast');
  };

  const value = {
    devices,
    sample,
    startBroadcast,
    stopBroadcast,
  };

  return (
    <PortAudioContext.Provider value={value}>
      {children}
    </PortAudioContext.Provider>
  );
};
