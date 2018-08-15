#!/bin/bash

# This script will perform all installing, building, and packaging.
# It must/should work from a freshly-cloned repository.


VERSION=1.1.1
echo "Building MSI installer for version $VERSION"
echo


# Find the WiX toolset installation
WIXDIR=$(reg query 'HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows Installer XML' //v InstallRoot //s |
perl -ne 'print ($1 =~ s/\\/\//gr =~ s/\/$//r) if /REG_SZ\s+([^\r\n]+)/')

if [ "$WIXDIR" == "" ]; then
	echo "WiX Toolset build tools are not installed. See http://wixtoolset.org/releases/" >&2
	exit 1
fi


# Run npm install if needed
[ ! -d client/node_modules ] && (cd client; npm install)


# Build the React code and the Electron binary directory
DEST=SimpleHttpClient-win32-x64
rm -rf $DEST &&
(
	cd client &&
	npm run build &&
	cd build &&
	../node_modules/.bin/electron-packager "$(pwd -W)" SimpleHttpClient --platform=win32 --arch=x64
) &&
mv client/build/$DEST . &&


# Create Windows Installer MSI
"$WIXDIR/heat.exe" \
  dir "./$DEST" \
  -scom -sreg -srd -gg \
  -cg ApplicationFiles \
  -dr INSTALLDIR \
  -sfrag -template fragment \
  -out directory.wxs \
  &&

"$WIXDIR/candle.exe" \
  -arch x64 installer.wxs directory.wxs \
	-dProductVersion=$VERSION \
  &&

"$WIXDIR/light.exe" \
  installer.wixobj directory.wixobj \
  -o SimpleHttpClient-$VERSION.msi \
  -b "$DEST" \
  -sice:ICE60

echo Done!
