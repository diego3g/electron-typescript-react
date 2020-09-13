import React, { useContext } from 'react';
import { PortAudioContext } from '../../contexts/PortAudioContext';
import { Button } from '@material-ui/core';

export const StopButton = () => {
  const { stopBroadcast } = useContext(PortAudioContext);
  const handleClick = () => {
    stopBroadcast();
  };
  return <Button onClick={handleClick}>Stop</Button>;
};
