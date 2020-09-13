/**
 * Context that manages state for the DeviceSelect
 * component.
 */
import React, { createContext, useState, useContext } from 'react';
import { DeviceInfo, PortAudioContext } from '../PortAudioContext';

type ContextType = {
  devices: DeviceInfo[];
  currentDevice: DeviceInfo | null;
  setCurrentDevice: (device: DeviceInfo | null) => void;
};

const initialState: ContextType = {
  devices: [],
  currentDevice: null,
  setCurrentDevice() {
    console.log("setCurrentDevice() hasn't been initialized yet");
  },
};

export const DeviceSelectContext = createContext<ContextType>(initialState);

export const DeviceSelectProvider: React.FC = ({ children }) => {
  const { devices } = useContext(PortAudioContext);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);

  const value = {
    devices,
    currentDevice,
    setCurrentDevice,
  };

  return (
    <DeviceSelectContext.Provider value={value}>
      {children}
    </DeviceSelectContext.Provider>
  );
};
