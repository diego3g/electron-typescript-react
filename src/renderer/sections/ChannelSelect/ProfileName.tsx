import React, { useContext } from 'react';
import { BotContext } from '../BotContext';

export const ProfileName: React.FC = () => {
  const { name } = useContext(BotContext);
  return <h1>{name}</h1>;
};
