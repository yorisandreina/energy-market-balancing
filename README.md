# Energy Market Balancing

This project includes a component that fetched data from two API endpoints to effectively display the hourly imbalance data at the balancing circle level and a drill-down feature of the related data at the member level.

## Get started

### Clone the repo

```shell
git clone https://github.com/yorisandreina/energy-market-balancing.git
cd energy-market-balancing
```

## Prerequisites

Before you begin, ensure you have met the following requirements:

* Node.js (version 18.19 or above)
* A code editor (e.g., Visual Studio Code)
* API environment variables setup in "src/app/common.service.ts file" in the this.baseUrl object 

### Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
npm run start
```

The `npm run start` command builds (compiles TypeScript and copies assets) the application into `dist/`, watches for changes to the source files, and runs on local machine.

Shut it down manually with `Ctrl-C`.

#### npm scripts

These are the most useful commands defined in `package.json`:

* `npm run start` - runs the TypeScript compiler, asset copier, and a server at the same time, all three in "watch mode".
* `npm run build` - runs the TypeScript compiler and asset copier once.
* `npm run build:watch` - runs the TypeScript compiler and asset copier in "watch mode"; when changes occur to source files, they will be recompiled or copied into `dist/`.
* `npm run test` - builds the application and runs Intern tests (both unit and functional) one time.
