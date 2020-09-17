import React, { useContext, useMemo } from 'react';
import { ChannelSelectContext } from '../../contexts/ChannelSelectContext';
import { VoiceChannelInfo, BotContext } from '../../contexts/BotContext';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@material-ui/core';

export const ChannelList: React.FC = () => {
  const { voiceChannels } = useContext(ChannelSelectContext);
  const { activeChannels, joinChannel, leaveChannel } = useContext(BotContext);

  const activeChannelLookup = useMemo(() => {
    const lookup = new Map<string, VoiceChannelInfo>();
    activeChannels.forEach((channel) => {
      lookup.set(channel.id, channel);
    });
    return lookup;
  }, [activeChannels]);

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
