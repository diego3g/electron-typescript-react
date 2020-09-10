/**
 * Hooks for interacting with portAudio
 */
import { useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';
import { BotContext } from '../sections/BotContext';

export type DeviceInfo = {
  id: number;
  name: string;
};

export function useDevices(): DeviceInfo[] {
  const [devices, setDevices] = useStateMemoArray<DeviceInfo, number>(
    [],
    (info) => info.id
  );
  ipcRenderer.invoke('get-devices').then((devices) => {
    setDevices(devices);
  });
  return devices;
}

export function startBroadcast(device: DeviceInfo) {
  ipcRenderer.invoke('start-broadcast', device);
}

export function stopBroadcast() {
  ipcRenderer.invoke('stop-broadcast');
}

async function getSample() {
  return await ipcRenderer.invoke('get-sample');
}

/**
 * Periodically fetches a new sample
 */
export function useSample() {
  const [sample, setSample] = useState(0);
  const { isLoggedIn } = useContext(BotContext);
  useEffect(() => {
    if (isLoggedIn) {
      const id = setInterval(async () => {
        const sample = await getSample();
        setSample(sample);
      }, 200);
      return () => clearInterval(sample);
    }
  }, [isLoggedIn]);

  return sample;
}
