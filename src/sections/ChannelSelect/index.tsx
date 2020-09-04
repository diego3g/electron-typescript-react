/**
 * This is used to connect to different voice channels.
 *
 * @NOTE might be too tightly coupled. Some of these components
 * may be able to be broken out, but I don't really know what the
 * best way to do that might be at this time
 * ~reccanti 9/4/2020
 */
import React, { useContext, useState } from 'react'
import { Guild, VoiceChannel } from 'discord.js'
import {
  InputLabel,
  NativeSelect,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox
} from '@material-ui/core'

import { DiscordBotContext } from '../../contexts/DiscordBotContext'

type ServerSelectProps = {
  value: Guild | null;
  servers: Guild[];
  onChange: (server: Guild) => void;
};
const ServerSelect: React.FC<ServerSelectProps> = ({
  value,
  servers,
  onChange
}) => {
  /**
   * Create a lookup map that associates servers with their
   * id. We'll use this to send the selected server to the
   * "onChange" method when the user selects it
   */
  const serverLookup = new Map<string, Guild>()
  servers.forEach((server) => {
    serverLookup.set(server.id, server)
  })

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serverName = event.target.value
    const server = serverLookup.get(serverName)
    if (!server) {
      throw Error('Unable to find the server you selected')
    }
    onChange(server)
  }

  return (
    <>
      <InputLabel htmlFor="ChannelSelect-serverSelect">
        Select a Server
      </InputLabel>
      <NativeSelect
        id="ChannelSelect-serverSelect"
        variant="outlined"
        value={(value && value.id) || ''}
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
  )
}

export const ChannelSelect: React.FC = () => {
  const [server, setServer] = useState<Guild | null>(null)
  const bot = useContext(DiscordBotContext)

  const servers = bot ? bot.getJoinedServers() : []
  const handleSelectServer = (server: Guild) => {
    setServer(server)
  }

  // initialize info about our voice channels
  const channels = new Set<VoiceChannel>()
  const activeChannels = new Set<VoiceChannel>()
  if (bot && server) {
    bot.getVoiceChannels(server).forEach((channel) => {
      channels.add(channel)
    })
    bot
      .getActiveVoiceChannels()
      .filter((channel) => channel.guild === server)
      .forEach((channel) => {
        activeChannels.add(channel)
      })
  }

  return (
    <div>
      <div>Current Server: {(server && server.name) || 'None'}</div>
      <ServerSelect
        value={server}
        onChange={handleSelectServer}
        servers={servers}
      />
      <List>
        {Array.from(channels.values()).map((channel) => (
          <ListItem
            dense
            button
            key={channel.id}
            onClick={() => {
              if (!bot) {
                return
              }
              if (activeChannels.has(channel)) {
                bot.leave(channel)
              } else {
                bot.join(channel)
              }
            }}
          >
            <ListItemIcon>
              <Checkbox checked={activeChannels.has(channel)} />
            </ListItemIcon>
            <ListItemText primary={channel.name} />
          </ListItem>
        ))}
      </List>
    </div>
  )
}
