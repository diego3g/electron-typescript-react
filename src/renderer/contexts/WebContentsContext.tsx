/**
 * This is used to detect when the app is "ready"
 * (i.e. when the main process has finished loading, and
 * the discord client has been launched). It also
 * formats messages from the server in a type-safe way
 * that can be understood by other parts of the frontend
 */
import React, { createContext, useEffect, useState, useMemo } from 'react';
import {
  RendererListener,
  RendererMessage,
  MessageCallback,
  IpcMainMessenger,
} from '../../messages';
import { ipcRenderer } from 'electron';

type ContextType = {
  isReady: boolean;
  rendererListener: RendererListener | null;
  mainMessenger: IpcMainMessenger | null;
};

export const WebContentsContext = createContext<ContextType>({
  isReady: false,
  rendererListener: null,
  mainMessenger: null,
});

export const WebContentsProvider: React.FC = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const rendererListener = useMemo(() => new RendererListener(ipcRenderer), []);
  const mainMessenger = useMemo(() => new IpcMainMessenger(ipcRenderer), []);

  useEffect(() => {
    const listen = (message: RendererMessage) => {
      if (message.type === 'backendReady') {
        setIsReady(true);
      }
    };
    rendererListener.addListener(listen);
    mainMessenger.send({ type: 'rendererReady' });
  }, [rendererListener]);

  const value = {
    isReady,
    rendererListener,
    mainMessenger,
  };

  console.log('rendering web contents');

  return (
    <WebContentsContext.Provider value={value}>
      {children}
    </WebContentsContext.Provider>
  );
};
