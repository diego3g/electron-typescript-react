import React, { createContext, useEffect, useState } from 'react'
import { Client } from 'discord.js'

export const DiscordClientContext = createContext<Client | null>(null)

export const DiscordClientProvider: React.FC = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null)
  useEffect(() => {
    const client = new Client()
    client.on('ready', () => {
      setClient(client)
    })
    client.login(process.env.DISCORD_BOT_TOKEN)
  }, [])
  return (
    <DiscordClientContext.Provider value={client}>
      {children}
    </DiscordClientContext.Provider>
  )
}
