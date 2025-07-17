## timecode converter

<!-- _One liner + link to confluence page_
_Screenshot of UI - optional_ -->

A modernized TypeScript fork of the original timecode-converter. This is a dependency-free `timecode-converter` module utility that can be used either client side or server side. 

Originally extracted from [`@bbc/react-transcript-editor/packages/util/timecode-converter`](https://github.com/bbc/react-transcript-editor/tree/master/packages/util/timecode-converter), and original code domain logic from [@bevand10](https://github.com/bevand10) 🙌

### What's New in This Fork
- 🚀 **TypeScript** - Full TypeScript support with strict mode
- 📦 **Modern Build** - Dual ESM/CJS builds using tsup
- 🧪 **Vitest** - Fast, modern testing framework
- 🔧 **pnpm** - Fast, disk space efficient package manager
- ✨ **Improved DX** - Better tooling and type safety

<details><summary>Why publish it as a standalone module?</summary>

The problem of exporting it from [`@bbc/react-transcript-editor`](https://github.com/bbc/react-transcript-editor) or [`@pietrop/slate-transcript-editor`](https://github.com/pietrop/slate-transcript-editor) is that, somehow it ends up expecting react as a peer dependency. 

And besides that not being ideal, or good practice, not only it can cause problems with keeping up with react peer dependency of other modules, but also add that as a peer dependency to other module consuming it, such as [@pietrop/edl-composer](https://github.com/pietrop/edl-composer) that doesn't really need any of that.
</details>


## Setup

<!-- _stack - optional_
_How to build and run the code/app_ -->

```
git clone git@github.com:jordanburke/timecode-converter.git
```
```
cd timecode-converter
```
```
pnpm install
```
## Usage
Some example, see the test files more more 
```js
import { secondsToTimecode, timecodeToSeconds, shortTimecode } from "timecode-converter";

const result1 = secondsToTimecode(600);
// '00:10:00:00'

const result2 = timecodeToSeconds( '00:10:00:00');
// 600

const result3 = shortTimecode(0)
// '00:00:00'

const result4 = shortTimecode( '00:10:00:00')
//  '00:10:00'
```
## System Architecture

<!-- _High level overview of system architecture_ -->

A node module 

<!-- ## Documentation

There's a [docs](./docs) folder in this repository.

[docs/notes](./docs/notes) contains dev draft notes on various aspects of the project. This would generally be converted either into ADRs or guides when ready.

[docs/adr](./docs/adr) contains [Architecture Decision Record](https://github.com/joelparkerhenderson/architecture_decision_record).

> An architectural decision record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

We are using [this template for ADR](https://gist.github.com/iaincollins/92923cc2c309c2751aea6f1b34b31d95) -->

## Development env

 _How to run the development environment_ -->

- npm > `6.1.0`
- [Node 12](https://nodejs.org/docs/latest-v12.x/api/)

Node version is set in node version manager [`.nvmrc`](https://github.com/creationix/nvm#nvmrc)

```
nvm use
```


<!-- _Coding style convention ref optional, eg which linter to use_ -->

<!-- _Linting, github pre-push hook - optional_ -->

## Build

<!-- _How to run build_ -->

```
pnpm build
```

This creates dual format builds in the `dist` folder:
- CommonJS (.js) 
- ESM (.mjs)
- TypeScript definitions (.d.ts)
## Tests

<!-- _How to carry out tests_ -->

```
pnpm test
```

Tests are now using [Vitest](https://vitest.dev/) for a modern testing experience.


## Deployment

<!-- _How to deploy the code/app into test/staging/production_ -->

To publish to npm 
```
pnpm publish:public
```
and for pre-flight checks 🔦🛫 
```
pnpm publish:dry:run
```