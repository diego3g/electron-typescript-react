import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import { DeviceSelectContext } from './DeviceSelectContext';
import { startBroadcast, stopBroadcast } from '../../hooks/portAudioHooks';

export { DeviceSelect } from './DeviceSelect';
export {
  DeviceSelectContext,
  DeviceSelectProvider,
} from './DeviceSelectContext';

export const StartButton = () => {
  const { currentDevice } = useContext(DeviceSelectContext);
  const handleClick = () => {
    if (currentDevice) {
      startBroadcast(currentDevice);
    }
  };
  return <Button onClick={handleClick}>Play</Button>;
};

export const StopButton = () => {
  const handleClick = () => {
    stopBroadcast();
  };
  return <Button onClick={handleClick}>Stop</Button>;
};
