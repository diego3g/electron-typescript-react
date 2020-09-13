import React, { useContext } from 'react';
import { BotContext } from '../../contexts/BotContext';
import { PortAudioContext } from '../../contexts/PortAudioContext';
import { Avatar, makeStyles, Box } from '@material-ui/core';

const hexToRGB = (hex: string) => {
  const digits = hex.replace('#', '');
  const r = parseInt(digits[0] + digits[1], 16);
  const g = parseInt(digits[2] + digits[3], 16);
  const b = parseInt(digits[4] + digits[5], 16);
  return { r, g, b };
};

const useActivityRingStyles = makeStyles((theme) => {
  const { r, g, b } = hexToRGB(theme.palette.secondary.dark);
  return {
    activity: (props: { opacity: number }) => ({
      borderRadius: '50%',
      border: `8px solid rgba(${r}, ${g}, ${b}, ${props.opacity})`,
      transition: `border 0.5s ease`,
      width: theme.spacing(18),
      height: theme.spacing(18),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
  };
});

const useImageStyles = makeStyles((theme) => {
  return {
    image: {
      height: theme.spacing(14),
      width: theme.spacing(14),
    },
  };
});

const ActivityRing: React.FC = ({ children }) => {
  const { sample } = useContext(PortAudioContext);
  const classes = useActivityRingStyles({ opacity: sample / 255 });
  return <Box className={classes.activity}>{children}</Box>;
};

export const ProfilePicture: React.FC = () => {
  const { avatarUrl } = useContext(BotContext);
  const classes = useImageStyles();
  return (
    <ActivityRing>
      <Avatar className={classes.image} src={avatarUrl || undefined} />
    </ActivityRing>
  );
};
