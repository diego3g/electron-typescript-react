/**
 * Wrapper for our Discord Bot. The purpose of this class is
 * twofold:
 *
 * 1. Collect complicated, sequential interactions with the Discord
 *    API into abstract actions (play, silence, join, etc...)
 * 2. Simplify the access of retrieving data (isPlaying, getVoiceChannels, etc...)
 *
 * Tips for writing new methods:
 *
 * - consider how functions might be composed together. Do you need
 *   a function like "disconnectAll" to leave all voice channels? Or can
 *   you leave it to consumers of this library to combine
 *   "getActiveVoiceChannels" with "leave"
 */
import {
  VoiceChannel,
  Guild,
  VoiceConnection,
  StreamDispatcher,
  Client,
  ClientPresenceStatus,
  TextChannel
} from 'discord.js'

type VoiceChannelInfo = {
  server: Guild;
  connection: VoiceConnection;
  dispatcher?: StreamDispatcher;
};

// utility type to get the types of streams that the VoiceConnection "play"
// method can accept
type VoiceConnectionStream = Parameters<VoiceConnection['play']>[0];

export class BotWrapper {
  /**
   * A list of channels the bot is active in
   */
  private channels = new Map<VoiceChannel, VoiceChannelInfo>();

  /**
   * Info about the client
   */
  private client: Client;

  constructor (client: Client) {
    this.client = client
  }

  get id () {
    if (this.client && this.client.user) {
      return this.client.user.id
    }
  }

  /**
   * Return all the voice channels our bot can join
   */
  getVoiceChannels (server: Guild): VoiceChannel[] {
    return Object.values(
      server.channels.cache.filter((channel) => channel.type === 'voice')
    )
  }

  /**
   * Return a list of all the voice channels our bot is
   * currently active in
   */
  getActiveVoiceChannels (): VoiceChannel[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Join a voice channel
   */
  async join (voiceChannel: VoiceChannel): Promise<void> {
    const connection = await voiceChannel.join()
    // connection.on("debug", console.log);
    this.channels.set(voiceChannel, {
      server: voiceChannel.guild,
      connection
    })
  }

  /**
   * Leave a voice channel, as long as we're currently
   * maintaining a connection to it.
   */
  leave (voiceChannel: VoiceChannel): void {
    const info = this.channels.get(voiceChannel)
    if (!info) {
      return
    }
    // cleanup our connections before leaving the channel
    const { connection } = info
    connection.disconnect()
    // leave the channel and remove it from our list
    voiceChannel.leave()
    this.channels.delete(voiceChannel)
  }

  /**
   * If we're in channel, start streaming audio in it
   */
  async play (
    voiceChannel: VoiceChannel,
    stream: VoiceConnectionStream
  ): Promise<void> {
    const info = this.channels.get(voiceChannel)
    // if we don't have a dispatcher that's playing audio,
    // create one and add it to our info object
    if (info && !info.dispatcher) {
      const dispatcher = info.connection.play(stream)
      this.channels.set(voiceChannel, { ...info, dispatcher })
    }
  }

  isPlaying (voiceChannel: VoiceChannel): boolean {
    const info = this.channels.get(voiceChannel)
    return !!(info && info.dispatcher)
  }

  /**
   * Silence any stream if we're playing in that voice channel.
   *
   * @NOTE Because we're using a broadcast, we don't really have
   * any way of controlling the audio volume, so instead we just
   * destroy the current dispatcher. A new one will be created
   * when the user calls "play" again
   *
   * ~reccanti 8/29/2020
   */
  silence (voiceChannel: VoiceChannel): void {
    const info = this.channels.get(voiceChannel)
    if (!info) {
      return
    }
    const { dispatcher, ...remainingInfo } = info
    if (dispatcher) {
      dispatcher.destroy()
      this.channels.set(voiceChannel, remainingInfo)
    }
  }

  /**
   * Set the Status of the bot
   */
  async setStatus (status: ClientPresenceStatus) {
    await this.client.user?.setStatus(status)
  }

  /**
   * Send a text message to a channel
   */
  async sendMessage (channel: TextChannel, message: string): Promise<void> {
    await channel.send(message)
  }
}
