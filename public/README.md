# Embedded Angular17 Acceptance Testing with Karma and Jasmine

The basic idea is to build a production application ensuring consistent and stable code using JavaScript, CSS and bootstrap linting and automated unit and e2e testing. This will be in part, assisted by the development tools, detailed in the [Development Overview](#development) and bundle sections.


[Production Build](#production-build)

[Test Build](#test-build)

[Development Overview](#development)

## Bundle Tools

> 1. [Browserify(ang12)](#i-browserify)
> 2. [Brunch(ang12)](#ii-brunch)
> 3. [esbuild](#iii-esbuild)
> 4. [Fusebox](#iv-fusebox) - no support for typescript 4.8.x, will build angular 14
> 5. [Parcel](#v-parcel)
> 6. [Rollup](#vi-rollup)
> 7. ~~[Steal](#vii-stealjs)~~
> 8. [Webpack](#viii-webpack)

[Installation](#installation)

[Docker](#ix-docker)

**Dodex**: Added for testing and demo. <https://github.com/DaveO-Home/dodex>

## Other Framworks

  1. **Canjs** - <https://github.com/DaveO-Home/embedded-acceptance-tests>
  2. **Vue** - <https://github.com/DaveO-Home/embedded-acceptance-tests-vue>
  3. **React** - <https://github.com/DaveO-Home/embedded-acceptance-tests-react>

## Main Tools

  1. Gulp
  2. Karma
  3. Jasmine
  4. Any Browser with a karma launcher
  5. Code bundling tools
  6. See `public/package.json` for details
  7. Node, npm - node v18 or greater works best

## Installation

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

**Desktop:**

  clone the repository or download the .zip

**Install Assumptions:**

  1. OS Linux or Windows(Tested on Windows10)
  1. Node and npm
  1. Gulp4 is default - If your global Gulp is version 3, you can execute `npx gulp` from the build directories or run the builds, for example, with __`./bm parcel prod`__ from the .../public directory.
  1. Google Chrome
  1. Firefox

**Server:**

  `cd` to top level directory `<install>/embedded-acceptance-tests-ng`

```bash
  npm install --legacy-peer-deps
```

  This will install a small Node/Koa setup to view the results of a production build.

  To install the demo

  `cd <install>/embedded-acceptance-tests/public`

```bash
  npm install --legacy-peer-deps
```

**Client:**

Test builds will generate bundles in 'dist_test' and production in the 'dist' directory at the root level, 'public'.

## Known Issues

  * Sporadic error with Webpack  
```
    Firefox 121.0 (Linux x86_64) ERROR
    An error was thrown in afterAll
    Expected false to be truthy.
    <Jasmine>
    __WEBPACK_DEFAULT_EXPORT__/</</observable<@webpack-internal:///32021:72:37
    ConsumerObserver.prototype.next@webpack-internal:///11403:113:33
    Subscriber.prototype._next@webpack-internal:///11403:80:26
    Subscriber.prototype.next@webpack-internal:///11403:51:18
    timer/</<@webpack-internal:///55710:28:28
    AsyncAction.prototype._execute@webpack-internal:///41172:79:18
```

  Repeating the command `./bm webpack prod` or `test` may fix the problem.

  * __esbuild__ may fail on initial install, it uses __`ngc`__. Try __`./bm esbuild ngprod`__ first before running __`./bm esbuild prod`__.

## Production Build

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

To generate a build "cd to `public/<bundler>/build` and type `gulp`, e.g.

```bash
  cd public/fusebox/build
  gulp
```

or `gulp prod`.

You can also use the convenience script `bm` in the `public` directory, e.g. __`./bm webpack prod`__. 

If the tests succeed then the build should complete.

To run the production application:

  1. `cd <install>/acceptance_tests`
  1. `npm start`  -  This should start a Node Server with port 3080.
  1. Start a browser and enter `localhost:3080/dist/<bundler>/appl/testapp.html`

You can repeat the procedure with any of the supported bundlers. Output from the build can be logged by setting the environment variable `USE_LOGFILE=true`.

You can run `gulp prd` from the `<bundler>/build` directory as a stand-alone build.

__Note:__ You can run the `bm` bash script from the public directory for any of the bundlers; e.g. __`./bm esbuild prd`__. For `webpack`, you can execute `npx ng build prodacc` or `npx ng build devacc` from the `webpack` directory to build the application. 

## Test Build

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

The test build simply runs the tests in headless mode. The default browsers are ChromeHeadless and FirefoxHeadless.  To change the default you can set an environment variable; e.g.

```bash
  export USE_BROWSERS=ChromeHeadless,Opera
```

to remove FirefoxHeadless from the browser list and add Opera.  You can also set this environment variable for a production build.

To run the tests "cd to `public/<bundler>/build` and type `gulp test`, e.g.

```bash
  cd public/webpack/build
  export USE_BROWSERS=FirefoxHeadless,ChromeHeadless,Opera
  gulp test
```
or
```bash
  cd .../public
  export USE_BROWSERS=FirefoxHeadless,ChromeHeadless,Opera
  ./bm webpack test
```
or
```bash
  cd .../public/webpack
  export USE_BROWSERS=FirefoxHeadless,ChromeHeadless,Opera
  npx ng test devacc
```


A test result might look like;

```text
[2019-09-05T14:21:30.265] [INFO] launcher - Starting browser Firefox
[2019-09-05T14:21:30.310] [INFO] launcher - Starting browser ChromeHeadless
[2019-09-05T14:21:30.352] [INFO] launcher - Starting browser Opera
  Unit Tests - Suite 1
    ✔ Verify that browser supports Promises
    ✔ ES6 Support
  Unit Tests - Suite 2
    ✔ Is Karma active
    ✔ Verify NaN
  Popper Defined - required for Bootstrap
    ✔ is JQuery defined
    ✔ is Popper defined
  Application Unit test suite - AppTest
    ✔ Is Default Page Loaded(Start)
    ✔ Is Tools Table Loaded
    ✔ Re-load Start Page
    ✔ Is Pdf Loaded
    ✔ Is Angular Welcome Loaded
    Load new tools page
      ✔ setup and click events executed.
      ✔ did Redux set default value.
      ✔ new page loaded on change.
      ✔ did Redux set new value.
      ✔ verify state management
    Contact Form Validation
      ✔ Contact form - verify required fields
      ✔ Contact form - validate populated fields, email mismatch.
      ✔ Contact form - validate email with valid email address.
      ✔ Contact form - validate form submission.
    Popup Login Form
      ✔ Login form - verify modal with login loaded
      ✔ Login form - verify cancel and removed from DOM
    Dodex Operation Validation
      ✔ Dodex - loaded and toggle on icon mousedown
      ✔ Dodex - Check that card A is current and flipped on mousedown
      ✔ Dodex - Check that card B is current and flipped on mousedown
      ✔ Dodex - Flip cards A & B back to original positions
      ✔ Dodex - Flip multiple cards on tab mousedown
      ✔ Dodex - Add additional app/personal cards
      ✔ Dodex - Load Login Popup from card1(A)
    Dodex Input Operation Validation
      ✔ Dodex Input - popup on mouse double click
      ✔ Dodex Input - Verify that form elements exist
      ✔ Dodex Input - verify that uploaded file is processed
      ✔ Dodex Input - close popup on button click

Finished in 32.012 secs / 26.381 secs @ 14:21:51 GMT-0700 (Pacific Daylight Time)

SUMMARY:
✔ 105 tests completed
...

[2019-09-05T14:22:05.965] [INFO] launcher - Starting browser Firefox
[2019-09-05T14:22:06.027] [INFO] launcher - Starting browser ChromeHeadless
[2019-09-05T14:22:06.094] [INFO] launcher - Starting browser Opera

  Unit Tests - Suite 2
    ✔ Verify NaN
    ✔ Is Karma active
  Unit Tests - Suite 1
    ✔ Verify that browser supports Promises
    ✔ ES6 Support
  Example HelloComponent
    ✔ should display a different test title
    ✔ should display original title
  Unit Tests - Suite 3
    ✔ Strip Webpack Block Code
    ✔ Strip Canjs Warning Code
  Test Welcome Router
    ✔ should navigate


Finished in 2.138 secs / 1.642 secs @ 14:22:14 GMT-0700 (Pacific Daylight Time)

SUMMARY:
✔ 27 tests completed
```

## Development

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

__Note__; When modifying project assets(.handlebars, .html, etc.) you can execute `gulp copy` from the `public/<bundler>/build` directory to preview changes. Some of the bundlers may not have this implemented.

__A word on developing tests__; You can write and execute tests quicker by using the rebuild process of a given bundler and running the `acceptance` gulp task after the auto-rebuild, e.g. with __Fusebox__ you can;

* `cd public/fusebox/build`
* `gulp hmr` or `gulp watch` as described each bundle tool section.
* Develop or modify a test.
* In another window execute `gulp acceptance` from the `build` directory to view the modified or new test results.

__Running Tests__-

  1. Run a full set of tests - `gulp test`, this will build the application and run all tests.
  2. Run e2e tests without build - `gulp e2e`.
  3. Run angular2 unit tests without build - `gulp ngtest`.

  **Both Chrome and Firefox are the default browsers.**  

### I. **Browserify**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Development Server Window*** -

   * `cd public/ang12/browserify/build`
   * `gulp server`

     Browsersync will start a browser tab(default Chrome) with `localhost:3080/dist_test/browserify/appl/testapp_dev.html`.  Any changes to the source code(\*.js|*.ts) files should be reflected in the browser auto reload.  

2. ***Hot Module Reload(HMR) Window*** -

   * `cd public/ang12/browserify/build`
   * `gulp hmr`

      The `watchify` plugin will remain active to rebuild the bundle on code change.

3. ***Test Driven Development(tdd) Window*** -

   * `cd public/ang12/browserify/build`
   * `gulp tdd`

### II. **Brunch**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Watch, Recompile and Reload Window*** -

   * `cd public/ang12/brunch/build`
   * `gulp watch` or `./cook watch` (output formatted better)  

    At this point you can start a browser and enter `localhost:3080/appl/testapp_dev.html`. Any changes to the source code(\*.js|*.ts) files and other assets such as*.html) should be reflected in the browser auto reload.  

    __Note__; The test url is `localhost:3080/appl` since Brunch by default uses 'config.paths.public' as the server context. Also, the reload may fail at times, Making a second code modification may work.

2. ***Test Driven Development(tdd) Window*** -

   * `cd public/ang12/brunch/build`
   * `gulp tdd` or `./cook tdd`

     While the Brunch watcher is running, tests are re-run when code sources are changed.

3. ***Special Considerations***
  
   * Brunch plugin eslint-brunch uses eslint 3. The demo uses version 4.  The `gulp`(production build) command uses a gulp linter, so javascript linting is executed. However, if you wish to use the Brunch eslint-brunch plugin, do the following;
   * `cd <install>/public/node_modules/eslint-brunch`
   * `npm install eslint@latest`
   * `cd <install>/public` and edit the `brunch-config.js` file and uncomment the eslint section.

### III. **ESbuild**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Hot Module Reload(HMR/Dev Server) Window*** -

   * `cd public/esbuild/build`
   * `gulp hmr`

      Browsersync will start a browser tab(default Chrome) with `localhost:3080/dist_test/esbuild/appl/testapp_dev.html`.  Any changes to the source code(\*.js|*.ts) files should be reflected in the browser auto reload.

2. ***Test Driven Development(tdd) Window*** -

   * `cd public/esbuild/build`
   * `gulp tdd`

__Note:__ The esbuild tasks use the `ngc` compiler to pre-process the application. You can build production with angular by executing __`./bm esbuild ngprod`__.

### IV. **Fusebox**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

__Note:__ Fusebox has been upgraded to version 4.

1. ***Hot Module Reload(HMR) Server Window*** -

   * `cd public/fusebox/build`
   * `gulp hmr`
   * If using TDD you must execute hmr with `gulp hmr --noftl` flag so that karma can detect changes. Or you can execute `gulp development` to run both hmr and tdd.

      At this point you can start a browser and enter `localhost:3080/dist_test/fusebox/appl/testapp_dev.html`.  Any changes to the source code(\*.js|*.ts) files should be reflected in the browser auto reload.

2. ***Test Driven Development(tdd) Window*** -

   * `cd public/fusebox/build`
   * `gulp tdd`

      The HMR Server must be running if you want tests to rerun as sources(\*.js|*.ts) are changed.

3. ***Production Preview*** -

   * `cd public/fusebox/build`
   * `gulp preview`

      Builds production without minimization and starts development server. View application in a browser with `localhost:3080/dist/fusebox/appl/testapp.html`.
  
  __Note:__ Fusebox does not support `typescript 4.8.x+`, last Angular version supported is 14.

### V. **Parcel**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Watch, Recompile and Reload Window*** -

   * `cd public/parcel/build`
   * `gulp watch` or `gulp serve`.

   At this point you can start a browser and enter `localhost:3080/dist_test/parcel/appl/testapp_dev.html`. Now using the built-in development from `Parcel 2` and .proxyrc file.

2. ***Test Driven Development(tdd) Window*** -

   * `cd public/parcel/build`
   * `gulp tdd`

     While the Parcel watcher is running, tests are re-run when code sources are changed.
  
   * Using `export USE_BUNDLER=false`-- when using `gulp tdd`, you can set USE_BUNDLER to false to startup TDD without building first.  

__Note:__ `gulp test` or `gulp rebuild` must be the lastest builds. `gulp watch` and `gulp serve` use the `Parcel` internal configuration for `watch` and `hmr`.  Also, by settting `USE_BUNDLER=false` before `gulp`(production build), then only testing and linting will execute.

### VI. **Rollup**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Development Server Window*** -

   * `cd public/rollup/build`
   * `gulp watch`
   * After a code change in a typescript source file, run `npx tsc` to generate the new javascript files.  

      The Rollup Development Server, Watch(auto-rebuild) and Page Reload functions are started together.  Simply use one of the following URLs in any browser; `localhost:3080/rollup/appl/testapp_dev.html` or `localhost:3080/dist_test/rollup/appl/testapp_dev.html`.

2. ***Test Driven Development(tdd) Window*** -

   * `cd public/rollup/build`
   * `gulp tdd`

### ~~VII. **Stealjs**~~

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Development Server Window*** -

  ***Important:*** Upgraded Karma from 4.4.1 to 5.1.0 - StealJs may open too many files so downgrade Karma to 4.4.1 or change your `ulimit -n 30000`.

  * `gulp test`
  * `gulp compile` - recompile typescript. __Note__ Production build will remove all generated *.js files gernerated by typescript. If you get **entry not found**, run this command.
  * `gulp prd` - build production without running tests

2. ***After a test run*** -

   * `gulp e2e` - run application tests
   * `gulp ngtest` - run angular unit tests

      At this point you can start a browser and enter `localhost:3080/stealjs/appl/testapp_dev.html`(please note that dist_test is not in the URL).

3. ***Test Driven Development(tdd) Window*** -

   * In multiple windows, `cd public/steal/build` and execute one of these commands;
   * `gulp hmr`
   * `gulp server`
   * `gulp tdd`

Or you can just try running `gulp development`.  

  __Note:__ After changing Angular code, i.e. *.ts files, execute `gulp compile` or `gulp test` to see changes.

### VIII. **Webpack**

[Top](#embedded-angular13-acceptance-testing-with-karma-and-jasmine)

1. ***Development HMR Server Window*** -

   * `cd public/webpack/build`
   * `gulp hmr`

2. ***Hot Module Reload(Watch) Window*** -

   * `cd public/webpack/build`
   * `gulp watch`

      At this point you can start a browser and enter `localhost:3080/dist_test/webpack/appl/testapp_dev.html`.  Any changes to the source code(\*.js|*.ts) files should be reflected in the browser auto reload. Running the application from the source directory should also work, e.g., `localhost:3080/webpack/appl/testapp_dev.html`.

3. ***Test Driven Development(tdd) Window*** -

   * `cd public/webpack/build`
   * `gulp tdd`

### IX. **Docker**

[Top](#embedded-angular2-acceptance-testing-with-karma-and-jasmine)

You can build a complete test/develpment environment on a Docker vm with the supplied Dockerfile.

**Linux as Parent Host**(assumes docker is installed and daemon is running)-

In the top parent directory, usually `..../embedded-acceptance-tests-ng/` execute the following commands;

1. ```docker build -t embedded fedora``` or ```docker build -t embedded centos```

2. ```docker run -ti --privileged  -p 3080:3080 -e DISPLAY=$DISPLAY  -v /tmp/.X11-unix:/tmp/.X11-unix --name test_env embedded bash```

    You should be logged into the test container(test_env). There will be 4 embedded-acceptance-tests* directories. Change into to default directory defined in the Dockerfile, for example canjs(embedded-acceptance-tests/public). All of the node dependencies should be installed, so ```cd``` to a desired bundler build directory, i.e. ```stealjs/build``` and follow the above instructions on testing, development and production builds.

3. When existing the vm after the ```docker run``` command, the container may be stopped. To restart execute ```docker start test_env``` and then ```docker exec -it --privileged --user tester -e DISPLAY=$DISPLAY -w /home/tester test_env bash```.  You can also use ```--user root``` to execute admin work.

**Windows as Parent Host**-

For Pro and Enterpise OS's, follow the Docker instructions on installation.  For the Home OS version you can use the legacy **Docker Desktop** client. It is best to have a Pro or Enterpise Windows OS to use a WSL(Windows bash) install. Use following commands with Windows;

1. ```docker build -t embedded fedora``` or ```docker build -t embedded centos```

2. ```docker run -ti --privileged  -p 3080:3080 --name test_env embedded bash```

3. ```docker exec -it --privileged --user tester -w /home/tester test_env bash```

The web port 3080 is exposed to the parent host, so once an application is sucessfully bundled and the node server(```npm start``` in directory embedded-acceptance-tests) is started, a host browser can view the application using say ```localhost:3080/dist/fusebox/appl/testapp.html```.  

__Note:__ Without a complete Pro/Enterprise docker installation, the `test_env` container can only run with Headless browsers. Therfore you should execute `export USE_BROWSERS=ChromeHeadless,FirefoxHeadless` before testing, development and building.
