/**
 * @TODO This file is essentially a duplicate of the current
 * types in the DefinitelyTyped repo, except where otherwise
 * noted:
 *
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/naudiodon/index.d.ts
 *
 * In the future, I might try making a PR to the definitelyTyped repo
 * ~reccanti 8/30/2020
 */

/// <reference types="node" />

// import { Readable, Writable, Duplex } from "stream";

declare module 'naudiodon' {
  import { Duplex, Readable, Writable } from 'stream';

  export {};

  /**
   * Updating this to export the Device type. Previously,
   * this was only defined locally, and so we couldn't use
   * it on its own
   */
  export interface Device {
    id: number;
    name: string;
    maxInputChannels: number;
    maxOutputChannels: number;
    defaultSampleRate: number;
    defaultLowInputLatency: number;
    defaultLowOutputLatency: number;
    defaultHighInputLatency: number;
    defaultHighOutputLatency: number;
    hostAPIName: number;
  }

  interface HostAPI {
    id: number;
    name: string;
    type: string;
    deviceCount: number;
    defaultInput: number;
    defaultOutput: number;
  }

  interface AudioOptions {
    deviceId?: number;
    channelCount?: number;
    sampleFormat?: number;
    sampleRate?: number;
    maxQueue?: number;
    /**
     * Adding the "closeOnError" property. For some
     * reason, this wasn't included before.
     */
    closeOnError?: boolean;
  }

  interface AudioStream {
    start(): void;
    quit(cb?: () => void): void;
    abort(cb?: () => void): void;
  }

  export function getDevices(): Device[];

  export function getHostAPIs(): {
    defaultHostAPI: number;
    HostAPIs: HostAPI[];
  };

  export const SampleFormatFloat32: number;
  export const SampleFormat8Bit: number;
  export const SampleFormat16Bit: number;
  export const SampleFormat24Bit: number;
  export const SampleFormat32Bit: number;

  /**
   * Updates the definitions of AudioIO so that
   * it's "new-able", as they demonstrate in the
   * documentation:
   *
   * https://github.com/Streampunk/naudiodon
   *
   * The original types are commented out below
   * for reference
   */
  interface ReadableOptions {
    inOptions: AudioOptions;
  }
  interface WritableOptions {
    outOptions: AudioOptions;
  }
  interface DuplexOptions {
    inOptions: AudioOptions;
    outOptions: AudioOptions;
  }

  type Options = ReadableOptions | WritableOptions | DuplexOptions;

  export type ReadableAudioStream = Readable & AudioStream;
  export type WritableAudioStream = Writable & AudioStream;
  export type DuplexAudioStream = Duplex & AudioStream;

  export const AudioIO: {
    new <T extends Options>(options: T): T extends ReadableOptions
      ? ReadableAudioStream
      : T extends WritableOptions
      ? WritableAudioStream
      : DuplexAudioStream;
  };
}
