# Dan's HTTP Client

Goal: to make a simple HTTP client that doesn't obscure the HTTP protocol's simple, text-based wire format.

## To build the Electron app and a Windows Installer MSI file

**Note:** be sure to increment the `VERSION` variable in `package.sh` in order to make sure the MSI can upgrade an older installed version.

```
./package.sh
```

## Running in development mode

From one Bash prompt:
```
./electron-dev-mode.sh
```

In another terminal:
```
cd client
npm start
```

## Development notes

* Uses [immer](https://github.com/mweststrate/immer) to make immutable changes in a much friendlier way than just pain JavaScript. Usually when you see the word `draft` in the code, assume that's an immer callback.

