/**
 * Hooks for interacting with portAudio
 */
import { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useStateMemoArray } from './useStateMemoArray';

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
  useEffect(() => {
    const id = setInterval(async () => {
      const sample = await getSample();
      setSample(sample);
    }, 200);
    return () => clearInterval(sample);
  });

  return sample;
}
