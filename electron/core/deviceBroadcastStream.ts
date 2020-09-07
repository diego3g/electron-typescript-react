/**
 * Creates a broadcast stream of the specified audio
 * device that we can reuse and pass to multiple VoiceConnections
 */
import { AudioIO, Device, SampleFormat16Bit } from 'naudiodon';
import { Client, VoiceBroadcast } from 'discord.js';

export function createDeviceBroadcastStream(
  client: Client,
  device: Device
): VoiceBroadcast {
  // create the broadcast stream
  const broadcast = client.voice?.createBroadcast();
  if (!broadcast)
    throw Error('Bot has not been initialized with a voice stream');

  /**
   * @NOTE A lot of these settings are required by discord
   * in order to play raw PCM data. Discord expects raw audio
   * streams to be a 2-channels, signed 16-bits, and have a
   * 48 kHz sample rate.
   *
   * I don't know if this is specifically mentioned anywhere.
   * I kind of gleaned it from the tip in the Basic Usage
   * section of this article and a lot of trial-and-error:
   *
   * https://discordjs.guide/voice/receiving-audio.html#basic-usage
   *
   * ~reccanti 8/29/2020
   */
  const ai = new AudioIO({
    inOptions: {
      channelCount: 2,
      sampleFormat: SampleFormat16Bit,
      sampleRate: 48000,
      deviceId: device.id,
      closeOnError: false,
    },
  });

  broadcast.play(ai, {
    type: 'converted',
  });

  ai.start();

  return broadcast;
}
