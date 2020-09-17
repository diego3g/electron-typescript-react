// node_modules
import React from 'react';
import { render } from 'react-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline, Box } from '@material-ui/core';

// components
import { ServerSelect } from './components/ServerSelect';
import { ChannelList } from './components/ChannelList';
import { ProfilePicture } from './components/ProfilePicture';
import { ProfileName } from './components/ProfileName';
import { DeviceSelect } from './components/DeviceSelect';
import { StartButton } from './components/StartButton';
import { StopButton } from './components/StopButton';
import { SettingsModal } from './components/Settings';

// contexts
import { ChannelSelectProvider } from './contexts/ChannelSelectContext';
import { DeviceSelectProvider } from './contexts/DeviceSelectContext';
import { BotProvider } from './contexts/BotContext';
import { PortAudioProvider } from './contexts/PortAudioContext';
import { WebContentsProvider } from './contexts/WebContentsContext';

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
    <WebContentsProvider>
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
    </WebContentsProvider>
  );
};

render(<App />, mainElement);
