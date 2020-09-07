/* eslint-disable */
/**
 * This file is pretty bad. The only reason we need it is to properly
 * rename the "prebuild" executable for "@discordjs/opus"
 */
const path = require('path');
const fs = require('fs');
const rebuild = require('electron-rebuild');

function renameOpusPrebuild() {
  // this will match the different parts of the original build, so
  // that we can apply them when we rename them
  const re = /(?<env>.*)-napi-v(?<napi_version>.*)-darwin-x64-unknown-(?<libc_version>.*)/;

  /**
   * Get the path to the opus "prebuild" directory that we
   * want to rename.
   */
  const opusPath = path.resolve(
    path.dirname(require.resolve('@discordjs/opus')),
    '..',
    'prebuild'
  );

  fs.readdir(opusPath, (err, files) => {
    if (err) throw err;

    const origBuild = files.find((file) => file.startsWith('node'));
    const electronBuild = files.find((file) => file.startsWith('electron'));
    if (!origBuild || !electronBuild) {
      console.warn(
        `Couldn't find any matching opus files in "${opusPath}" to rename`
      );
      return;
    }

    // extract the "napi_version" and "libc_version" from the
    // name of the original build file
    const { napi_version, libc_version } = re.exec(origBuild).groups;

    // replace the electronBuild file with these new values
    const newElectronBuild = electronBuild
      .replace('{napi_build_version}', napi_version)
      .replace('{libc_version}', libc_version);

    // rename the electron folder
    fs.rename(
      path.resolve(opusPath, electronBuild),
      path.resolve(opusPath, newElectronBuild),
      () => {
        console.log('electron build path renamed');
      }
    );
  });
}

// renameOpusPrebuild();

rebuild
  .rebuild({
    buildPath: path.resolve(__dirname, '..'),
    force: true,
    onlyModules: ['@discordjs/opus', 'naudiodon', 'segfault-handler'],
    electronVersion: '10.1.1', // hard-coding this for now
  })
  .then(() => {
    renameOpusPrebuild();
  })
  .catch((err) => {
    console.log('failed');
    console.log(err);
  });
