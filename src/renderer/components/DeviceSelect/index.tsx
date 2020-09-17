/**
 * Currently this is just a scratch file for
 * testing if device info is being sent correctly.
 * Eventually, everything here should be split into
 * a Context and individual components.
 */

import React, { useContext } from 'react';
import { InputLabel, NativeSelect, FormControl } from '@material-ui/core';
import { DeviceInfo } from '../../contexts/PortAudioContext';
import { DeviceSelectContext } from '../../contexts/DeviceSelectContext';

const makeLookup = (device: DeviceInfo) => `${device.id}_${device.name}`;

export const DeviceSelect: React.FC = () => {
  const { devices, currentDevice, setDevice } = useContext(DeviceSelectContext);

  const deviceLookup = new Map<string, DeviceInfo>();
  devices.forEach((device) => {
    deviceLookup.set(makeLookup(device), device);
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const device = deviceLookup.get(value);
    if (!device) {
      setDevice(null);
      return;
    }
    setDevice(device);
  };

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="DeviceSelect">Device</InputLabel>
      <NativeSelect
        id="DeviceSelect"
        value={(currentDevice && makeLookup(currentDevice)) || ''}
        onChange={handleChange}
        fullWidth
      >
        <option value="" aria-label="none"></option>
        {devices.map((device) => (
          <option key={makeLookup(device)} value={makeLookup(device)}>
            {device.name}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};
