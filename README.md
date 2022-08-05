## Electron + TypeScript + React

Boilerplate for a project using Electron, React and Typescript.

## Installation

Use a package manager of your choice (npm, yarn, etc.) in order to install all dependencies

```bash
yarn
```

## Usage

Just run `start` script.

```bash
yarn start
```

## Packaging

To generate the project package based on the OS you're running on, just run:

```bash
yarn package
```

## Using assets

1. Place your images or icons in `assets` folder

2. Read assets from `process.resourcePath` for production build, `./` for development

```typescript
// electron/main.ts
const basePath =
  process.env.NODE_ENV === 'development' ? '' : process.resourcesPath
const iconImage = nativeImage.createFromPath(
  path.resolve(basePath, 'assets', 'tray.png')
)
const tray = new Tray(iconImage.resize({ width: 16, height: 16 }))
```

## Contributing

Pull requests are always welcome 😃.

## License

[MIT](https://choosealicense.com/licenses/mit/)
