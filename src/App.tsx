import React from 'react';
import { render } from 'react-dom';
// import { ProfileInfo } from './sections/ProfileInfo';
import {
  ServerSelect,
  ChannelList,
  ChannelSelectProvider,
} from './sections/ChannelSelect/index';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

const style = document.createElement('style');
style.innerHTML = `
html {
  -webkit-app-region: drag;
}`;
document.head.appendChild(style);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box p={theme.spacing(1)}>
        {/* <ProfileInfo /> */}
        <ChannelSelectProvider>
          <ServerSelect />
          <ChannelList />
        </ChannelSelectProvider>
      </Box>
    </ThemeProvider>
  );
};

render(<App />, mainElement);
