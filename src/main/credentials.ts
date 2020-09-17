/**
 * Functions for getting/setting Discord credentials
 * 
 * @NOTE currently this only covers the Discord Client
 * Token, but keeping it generic in case we need to add
 * more in the future
 */
import os from 'os';
import keytar from 'keytar';

const SERVICE = 'loudredapp';
const username = os.userInfo().username;

export async function setToken(token: string) {
  return await keytar.setPassword(SERVICE, username, token);
}

export async function getToken() {
  return await keytar.getPassword(SERVICE, username);
}
