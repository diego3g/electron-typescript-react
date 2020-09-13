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
  RendererMessageCallback,
} from '../../messages';
import { ipcRenderer } from 'electron';

type ContextType = {
  isReady: boolean;
  addListener: (cb: RendererMessageCallback) => void;
  removeListener: (cb: RendererMessageCallback) => void;
};

export const WebContentsContext = createContext<ContextType>({
  isReady: false,
  addListener() {
    console.log('addListener() not initialized yet');
  },
  removeListener() {
    console.log('removeListener() not initialized yet');
  },
});

export const WebContentsProvider: React.FC = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const rendererListener = useMemo(() => new RendererListener(ipcRenderer), []);

  useEffect(() => {
    const listen = (message: RendererMessage) => {
      if (message.type === 'backendReady') {
        setIsReady(true);
      }
    };
    rendererListener.addListener(listen);
    return () => {
      rendererListener.removeListener(listen);
    };
  }, [rendererListener]);

  const addListener = (cb: RendererMessageCallback) => {
    rendererListener.addListener(cb);
  };

  const removeListener = (cb: RendererMessageCallback) => {
    rendererListener.removeListener(cb);
  };

  const value = {
    isReady,
    addListener,
    removeListener,
  };

  console.log('rendering web contents');

  return (
    <WebContentsContext.Provider value={value}>
      {children}
    </WebContentsContext.Provider>
  );
};
