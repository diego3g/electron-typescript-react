/**
 * This is where we display the settings for the application.
 *
 * @TODO it might be better to make this a separate page that's
 * managed with React Router eventually. It's pretty basic right
 * now though, and we don't really have many other pages, so I'm
 * keeping it a modal for now.
 *
 * ~reccanti 9/9/2020
 */
import React, { useState, useContext, useEffect } from 'react';
import {
  IconButton,
  Modal,
  Button,
  Box,
  makeStyles,
  TextField,
} from '@material-ui/core';
import { Settings, ArrowBack } from '@material-ui/icons';
import { BotContext } from '../../contexts/BotContext';

const useStyles = makeStyles((theme) => {
  return {
    modal: {
      height: '100%',
    },
    inner: {
      padding: theme.spacing(8),
      height: '100%',
      backgroundColor: theme.palette.background.default,
      '&:focus': {
        outline: '0px',
      },
    },
  };
});

export const SettingsModal: React.FC = () => {
  const { login, token: initialToken } = useContext(BotContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string>(initialToken);
  const classes = useStyles();

  /**
   * If the initial token changes, update the token
   * that we display in the token field
   */
  useEffect(() => {
    setToken(initialToken);
  }, [initialToken]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value;
    setToken(token);
  };

  const handleSaveChanges = () => {
    login(token);
  };

  return (
    <>
      <IconButton onClick={openModal} aria-label="Settings">
        <Settings />
      </IconButton>
      <Modal className={classes.modal} open={isOpen}>
        <Box className={classes.inner} display="flex" flexDirection="column">
          {/* Top Bar*/}
          <Box>
            <Button onClick={closeModal}>
              <ArrowBack />
              Back
            </Button>
          </Box>
          {/* Settings */}
          <Box flex={1}>
            <TextField
              value={token}
              label="Discord Client Token"
              fullWidth
              type="password"
              onChange={handleTokenChange}
            />
          </Box>
          {/* Bottom Bar */}
          <Box>
            <Button onClick={handleSaveChanges} variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
