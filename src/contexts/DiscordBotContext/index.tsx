import React, { createContext, useContext, useMemo } from 'react'
import { DiscordClientContext } from '../DiscordClientContext'
import { BotWrapper } from '../../core/botWrapper'

export const DiscordBotContext = createContext<BotWrapper | null>(null)

export const DiscordBotProvider: React.FC = ({ children }) => {
  const client = useContext(DiscordClientContext)
  const bot = useMemo(() => {
    if (!client) {
      return null
    }
    const bot = new BotWrapper(client)
    return bot
  }, [client])
  return (
    <DiscordBotContext.Provider value={bot}>
      {children}
    </DiscordBotContext.Provider>
  )
}
