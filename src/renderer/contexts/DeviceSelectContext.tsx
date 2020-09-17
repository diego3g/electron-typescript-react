/**
 * Context that manages state for the DeviceSelect
 * component.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { PortAudioContext } from './PortAudioContext';
import { WebContentsContext } from './WebContentsContext';
import { DeviceInfo, RendererMessage } from '../../messages';
import { BotContext } from './BotContext';

type ContextType = {
  devices: DeviceInfo[];
  currentDevice: DeviceInfo | null;
  setDevice: (device: DeviceInfo | null) => void;
};

const initialState: ContextType = {
  devices: [],
  currentDevice: null,
  setDevice() {
    console.log("setDevice() hasn't been initialized yet");
  },
};

export const DeviceSelectContext = createContext<ContextType>(initialState);

export const DeviceSelectProvider: React.FC = ({ children }) => {
  const { isReady, rendererListener, mainMessenger } = useContext(
    WebContentsContext
  );
  const { isLoggedIn } = useContext(BotContext);
  const { devices } = useContext(PortAudioContext);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    if (isLoggedIn && isReady && rendererListener) {
      const listen = (msg: RendererMessage) => {
        if (msg.type === 'backendDeviceSet') {
          setCurrentDevice(msg.device);
        }
      };
      rendererListener.addListener(listen);
      return () => rendererListener.removeListener(listen);
    }
  }, [isReady, rendererListener, isLoggedIn]);

  const setDevice = (device: DeviceInfo | null) => {
    if (device && mainMessenger) {
      mainMessenger.send({ type: 'rendererSetDevice', device });
    }
  };

  const value = {
    devices,
    currentDevice,
    setDevice,
  };

  return (
    <DeviceSelectContext.Provider value={value}>
      {children}
    </DeviceSelectContext.Provider>
  );
};
