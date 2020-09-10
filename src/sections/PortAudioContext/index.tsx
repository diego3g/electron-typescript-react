import React, { createContext, useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { BotContext } from '../BotContext';

export type DeviceInfo = {
  id: number;
  name: string;
};

type ContextType = {
  devices: DeviceInfo[];
  sample: number;
};

export const PortAudioContext = createContext<ContextType>({
  devices: [],
  sample: 0,
});

export const PortAudioProvider: React.FC = ({ children }) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [sample, setSample] = useState(0);
  const { isLoggedIn } = useContext(BotContext);

  useEffect(() => {
    Promise.all([ipcRenderer.invoke('get-devices')]).then(([devices]) => {
      setDevices(devices);
    });
  }, [isLoggedIn]);

  useEffect(() => {
    let duration = 0;
    const id = requestAnimationFrame((delta) => {
      if (duration > 1000) {
        duration = 0;
        ipcRenderer.invoke('get-sample').then((sample) => {
          setSample(sample);
        });
      } else {
        duration += delta;
      }
    });
    return () => cancelAnimationFrame(id);
  }, [isLoggedIn]);

  const value = {
    devices,
    sample,
  };

  return (
    <PortAudioContext.Provider value={value}>
      {children}
    </PortAudioContext.Provider>
  );
};
