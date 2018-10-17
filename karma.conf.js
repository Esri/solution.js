// Karma configuration
// Generated on Tue Oct 16 2018 14:43:15 GMT-0700 (Pacifique (heure d’été))

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: '{src,test}/**/*.ts', included: false },
      { pattern: '{src,test}/**/*.js', included: false }
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    karmaTypescriptConfig: {
      reports: {
        lcovonly: "coverage",
        html: "coverage",
        text: ""
      },
      compilerOptions: {
        module: "umd"
      },
      tsconfig: "./tsconfig.json"
    },


    // coveralls uses this one. still need to figure out how to DRY this up.
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      "**/*.ts": ["karma-typescript"] // *.tsx for React Jsx
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['karma-typescript', 'coverage', 'coveralls'],
    reporters: ['karma-typescript'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'ChromeHeadless', 'Firefox', 'IE'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,


    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,


    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }

  })
}
