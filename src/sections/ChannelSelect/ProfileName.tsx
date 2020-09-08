import React, { useContext } from 'react';
import { ChannelSelectContext } from './ChannelSelectContext';

export const ProfileName: React.FC = () => {
  const { botName } = useContext(ChannelSelectContext);
  return <h1>{botName}</h1>;
};
