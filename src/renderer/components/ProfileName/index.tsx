import React, { useContext } from 'react';
import { BotContext } from '../../contexts/BotContext';

export const ProfileName: React.FC = () => {
  const { name } = useContext(BotContext);
  return <h1>{name}</h1>;
};
