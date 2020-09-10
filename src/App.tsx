import React from 'react';
import { render } from 'react-dom';
import {
  ServerSelect,
  ChannelList,
  ChannelSelectProvider,
  ProfilePicture,
  ProfileName,
} from './sections/ChannelSelect/index';
import {
  DeviceSelect,
  DeviceSelectProvider,
  StartButton,
  StopButton,
} from './sections/DeviceSelect/index';
import { BotProvider } from './sections/BotContext';
import { SettingsModal } from './sections/Settings';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { PortAudioProvider } from './sections/PortAudioContext';

/**
 * Setup the page by applying elements and style tags to hook into
 */
const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

const style = document.createElement('style');
style.innerHTML = `
html, body, #root {
  -webkit-app-region: drag;
  height: 100%;
}`;
document.head.appendChild(style);

/**
 * Define a wrapper that sets up all of our Providers
 */
const App = () => {
  const theme = createMuiTheme({
    palette: {
      type: 'dark',
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
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });
  return (
    <BotProvider>
      <PortAudioProvider>
        <ChannelSelectProvider>
          <DeviceSelectProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                p={theme.spacing(1)}
                display="flex"
                flexDirection="column"
                height="100%"
              >
                <Box display="flex" justifyContent="flex-end">
                  <SettingsModal />
                </Box>
                <Box
                  display="flex"
                  position="relative"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <ProfilePicture />
                  <ProfileName />
                </Box>
                <DeviceSelect />
                <Box flexGrow={1}>
                  <ServerSelect />
                  <ChannelList />
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  justifySelf="flex-end"
                >
                  <StartButton />
                  <StopButton />
                </Box>
              </Box>
            </ThemeProvider>
          </DeviceSelectProvider>
        </ChannelSelectProvider>
      </PortAudioProvider>
    </BotProvider>
  );
};

render(<App />, mainElement);
