import React, { useContext, useMemo } from 'react';
import { ChannelSelectContext } from './ChannelSelectContext';
import { VoiceChannelInfo } from '../../hooks/discordBotHooks';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@material-ui/core';

export const ChannelList: React.FC = () => {
  const {
    voiceChannels,
    activeVoiceChannels,
    joinChannel,
    leaveChannel,
  } = useContext(ChannelSelectContext);

  const activeChannelLookup = useMemo(() => {
    const lookup = new Map<string, VoiceChannelInfo>();
    activeVoiceChannels.forEach((channel) => {
      lookup.set(channel.id, channel);
    });
    return lookup;
  }, [activeVoiceChannels]);

  return (
    <List>
      {voiceChannels.map((channel) => (
        <ListItem
          key={channel.id}
          dense
          button
          onClick={() =>
            activeChannelLookup.has(channel.id)
              ? leaveChannel(channel)
              : joinChannel(channel)
          }
        >
          <ListItemIcon>
            <Checkbox checked={activeChannelLookup.has(channel.id)} />
          </ListItemIcon>
          <ListItemText primary={channel.name} />
        </ListItem>
      ))}
    </List>
  );
};
