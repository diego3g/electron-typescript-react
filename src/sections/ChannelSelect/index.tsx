/**
 * This is used to connect to different voice channels.
 *
 * @NOTE might be too tightly coupled. Some of these components
 * may be able to be broken out, but I don't really know what the
 * best way to do that might be at this time
 * ~reccanti 9/4/2020
 */
import React, { useState } from 'react';
import {
  InputLabel,
  NativeSelect,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
} from '@material-ui/core';

import {
  ServerInfo,
  useJoinedServers,
  useVoiceChannelsInServer,
  useActiveVoiceChannels,
  join,
  leave,
} from '../../hooks/discordBotHooks';

type ServerSelectProps = {
  value: string | null;
  servers: ServerInfo[];
  onChange: (server: ServerInfo) => void;
};
const ServerSelect: React.FC<ServerSelectProps> = ({
  value,
  servers,
  onChange,
}) => {
  /**
   * Create a lookup map that associates servers with their
   * id. We'll use this to send the selected server to the
   * "onChange" method when the user selects it
   */
  const serverLookup = new Map<string, ServerInfo>();
  servers.forEach((server) => {
    serverLookup.set(server.id, server);
  });

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serverName = event.target.value;
    const server = serverLookup.get(serverName);
    if (!server) {
      throw Error('Unable to find the server you selected');
    }
    onChange(server);
  };

  return (
    <>
      <InputLabel htmlFor="ChannelSelect-serverSelect">
        Select a Server
      </InputLabel>
      <NativeSelect
        id="ChannelSelect-serverSelect"
        variant="outlined"
        value={value || ''}
        onChange={handleChange}
      >
        <option value="" aria-label="none">
          Server
        </option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </NativeSelect>
    </>
  );
};

export const ChannelSelect: React.FC = () => {
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);
  const servers = useJoinedServers();
  const voiceChannels = useVoiceChannelsInServer(
    selectedServer ? selectedServer.id : ''
  );
  const activeVoiceChannels = useActiveVoiceChannels();

  console.log(selectedServer);

  // initialize info about our voice channels
  const activeChannelLookup = new Set<string>();
  activeVoiceChannels.forEach((channel) => {
    activeChannelLookup.add(channel.id);
  });

  const handleSelectServer = (serverInfo: ServerInfo) => {
    console.log(serverInfo);
    setSelectedServer(serverInfo);
  };

  return (
    <div>
      <div>
        Current Server: {(selectedServer && selectedServer.name) || 'None'}
      </div>
      <ServerSelect
        value={selectedServer ? selectedServer.id : ''}
        onChange={handleSelectServer}
        servers={servers}
      />
      <List>
        {voiceChannels.map((channel) => (
          <ListItem
            dense
            button
            key={channel.id}
            onClick={() => {
              if (!activeChannelLookup.has(channel.id)) {
                join(channel);
              }
              leave(channel);
            }}
          >
            <ListItemIcon>
              <Checkbox checked={activeChannelLookup.has(channel.id)} />
            </ListItemIcon>
            <ListItemText primary={channel.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  //   return <div>Hello world</div>;
};
