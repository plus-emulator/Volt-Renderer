# Volt Renderer

Volt Renderer is the engine behind [Volt](https://github.com/plus-emulator/Volt). It draws rooms, avatars and furniture, and it talks to the [PlusEMU](https://github.com/plus-emulator/PlusEMU) server. It is a library, not an app.

It started as a fork of [Nitro Renderer](https://github.com/billsonnn/nitro-renderer) and is developed on its own.

Full guides are on the documentation site: <https://docs.plusemu.dev/getting-started/volt-client/>

## Setup

A hotel owner does not install the renderer on its own. Every [Volt release](https://github.com/plus-emulator/Volt/releases) already contains it.

To work on Volt from source, put the renderer next to Volt:

```sh
git clone https://github.com/plus-emulator/Volt.git
git clone https://github.com/plus-emulator/Volt-Renderer.git
corepack enable
(cd Volt-Renderer && yarn install)
(cd Volt && yarn install)
```

Volt reads the renderer from `../Volt-Renderer`. See [Set up the Volt client](https://docs.plusemu.dev/getting-started/volt-client/#build-from-source).

## Update

```sh
cd Volt-Renderer
git pull
yarn install
```

Then build Volt again. Update PlusEMU and the renderer together, because their packet versions must match.

## Packet version

The renderer says hello to the server with the Habbo AIR build `WIN63-202610201032-107964540` (`ClientHelloMessageComposer.BUILD`). Custom Volt packets still work. This does not mean the renderer works with the native AIR client.

## More

- [JSON and JSONC parser](docs/json-parser.md)
- [Split game data loader](docs/gamedata-loader.md)
- [Contributing](CONTRIBUTING.md)

## Licence

[GPL-3.0](LICENSE).
