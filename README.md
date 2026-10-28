# Volt Renderer

Volt Renderer is the rendering and networking library behind [Volt](https://github.com/plus-emulator/Volt). It renders rooms, avatars and furniture, and implements the packet protocol of [PlusEMU](https://github.com/plus-emulator/PlusEMU). Volt Renderer began as a fork of Nitro Renderer and is now developed independently.

Documentation: <https://docs.plusemu.dev/getting-started/volt-client/>

## Setup

The renderer is bundled into every [Volt release](https://github.com/plus-emulator/Volt/releases). Install it separately only to develop Volt.

To develop from source, clone both repositories side by side:

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

Then rebuild Volt. Update PlusEMU and the renderer together; their protocol versions must match.

## Protocol version

The client handshake advertises Habbo AIR build `WIN63-202610271147-806594867` (`ClientHelloMessageComposer.BUILD`).

Volt-specific protocol extensions are supported alongside the AIR packet set. The build string does not imply compatibility with the native AIR client.

## More

- [JSON and JSONC parser](docs/json-parser.md)
- [Split game data loader](docs/gamedata-loader.md)
- [Contributing](CONTRIBUTING.md)

## Licence

[GPL-3.0](LICENSE).
