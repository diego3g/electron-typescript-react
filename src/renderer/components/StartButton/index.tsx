import React, { useContext } from 'react';
import { PortAudioContext } from '../../contexts/PortAudioContext';
import { DeviceSelectContext } from '../../contexts/DeviceSelectContext';
import { Button } from '@material-ui/core';

export const StartButton = () => {
  const { currentDevice } = useContext(DeviceSelectContext);
  const { startBroadcast } = useContext(PortAudioContext);
  const handleClick = () => {
    if (currentDevice) {
      startBroadcast(currentDevice);
    }
  };
  return <Button onClick={handleClick}>Play</Button>;
};
