/**
 * This displays information about our bot, such as
 * its image and name
 */
import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'

import { DiscordBotContext } from '../../contexts/DiscordBotContext'

const useStyles = makeStyles((theme) => {
  return {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& > :not(:first-child)': {
        marginLeft: theme.spacing(1)
      }
    },
    avatar: {
      width: theme.spacing(8),
      height: theme.spacing(8)
    }
  }
})

export const ProfileInfo: React.FC = () => {
  const classes = useStyles()

  const bot = useContext(DiscordBotContext)
  const botAvatarURL = (bot && bot.getAvatarUrl()) || ''
  const botName = (bot && bot.name) || <em>Bot not specifed</em>

  return (
    <Box component="header" className={classes.container}>
      <Avatar className={classes.avatar} src={botAvatarURL} />
      <Box component="h1">{botName}</Box>
    </Box>
  )
}
