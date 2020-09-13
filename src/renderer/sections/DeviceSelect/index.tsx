import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import { DeviceSelectContext } from './DeviceSelectContext';
import { PortAudioContext } from '../PortAudioContext';

export { DeviceSelect } from './DeviceSelect';
export {
  DeviceSelectContext,
  DeviceSelectProvider,
} from './DeviceSelectContext';

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

export const StopButton = () => {
  const { stopBroadcast } = useContext(PortAudioContext);
  const handleClick = () => {
    stopBroadcast();
  };
  return <Button onClick={handleClick}>Stop</Button>;
};
