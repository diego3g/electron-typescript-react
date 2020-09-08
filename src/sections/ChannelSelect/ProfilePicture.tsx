import React, { useContext } from 'react';
import { ChannelSelectContext } from './ChannelSelectContext';
import { useSample } from '../../hooks/portAudioHooks';
import { Avatar, makeStyles } from '@material-ui/core';

const hexToRGB = (hex: string) => {
  const digits = hex.replace('#', '');
  const r = parseInt(digits[0] + digits[1], 16);
  const g = parseInt(digits[2] + digits[3], 16);
  const b = parseInt(digits[4] + digits[5], 16);
  return { r, g, b };
};

const useStyles = makeStyles((theme) => {
  const { r, g, b } = hexToRGB(theme.palette.secondary.dark);
  return {
    image: (props: { opacity: number }) => ({
      height: theme.spacing(16),
      width: theme.spacing(16),
      borderRadius: '50%',
      border: `8px solid rgba(${r}, ${g}, ${b}, ${props.opacity})`,
      transition: `border 0.2s ease`,
    }),
  };
});

export const ProfilePicture: React.FC = () => {
  const { botAvatarUrl } = useContext(ChannelSelectContext);
  const sample = useSample();
  const classes = useStyles({ opacity: sample / 255 });
  return (
    <Avatar
      className={classes.image}
      src={(botAvatarUrl && botAvatarUrl) || undefined}
    />
  );
};
