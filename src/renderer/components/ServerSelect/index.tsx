import React, { useContext, useMemo } from 'react';
import { ChannelSelectContext } from '../../contexts/ChannelSelectContext';
import { BotContext, ServerInfo } from '../../contexts/BotContext';
import { InputLabel, NativeSelect, FormControl } from '@material-ui/core';

export const ServerSelect: React.FC = () => {
  const { servers } = useContext(BotContext);
  const { currentServer, setCurrentServer } = useContext(ChannelSelectContext);

  const serverLookup = useMemo(() => {
    const lookup = new Map<string, ServerInfo>();
    servers.forEach((server) => {
      lookup.set(server.id, server);
    });
    return lookup;
  }, [servers]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const serverId = event.target.value;
    const server = serverLookup.get(serverId) || null;
    setCurrentServer(server);
  };

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="ServerSelect">Server</InputLabel>
      <NativeSelect
        id="ServerSelect"
        value={(currentServer && currentServer.id) || ''}
        onChange={handleChange}
        fullWidth
      >
        <option value="" aria-label="none"></option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </NativeSelect>
    </FormControl>
  );
};
