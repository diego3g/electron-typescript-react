import React from 'react'
import { render } from 'react-dom'
import { DiscordClientProvider } from './contexts/DiscordClientContext'
import { DiscordBotProvider } from './contexts/DiscordBotContext'
import { ProfileInfo } from './sections/ProfileInfo'
import { ChannelSelect } from './sections/ChannelSelect'

import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'

const mainElement = document.createElement('div')
mainElement.setAttribute('id', 'root')
document.body.appendChild(mainElement)

const App = () => {
  const theme = createMuiTheme({
    palette: {
      type: 'dark'
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(',')
    }
  })
  console.log(theme)
  return (
    <DiscordClientProvider>
      <DiscordBotProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ProfileInfo />
          <ChannelSelect />
        </ThemeProvider>
      </DiscordBotProvider>
    </DiscordClientProvider>
  )
}

render(<App />, mainElement)
