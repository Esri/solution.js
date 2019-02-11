module.exports = function(grunt) {
  'use strict';
  grunt.file.defaultEncoding = 'utf8';
  grunt.file.preserveBOM = false;

  // Project tasks configuration
  grunt.initConfig({
    'install-hook': {
    },
    tslint: {
      options: {
        // can be a configuration object or a filepath to tslint.json
        configuration: "./tslint.json",
        project: "./tsconfig.json",
        // If set to true, tslint errors will be reported, but not fail the task
        // If set to false, tslint errors will be reported, and the task will fail
        force: false,
        fix: false
      },
      files: {
        src: [
          "./src/**/*.ts",
          "./test/**/*.ts"
          ]
      }
    }
  })

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-tslint');

  // Default tasks
  grunt.registerTask('default', ['tslint']);

  // Other tasks
  grunt.registerTask('install-hook', 'install git pre commit hook', function() {
    var fs = require('fs');
    var fse = require('fs-extra');
    var path = require('path');
    var hookFile = path.join(__dirname, '.git/hooks/pre-commit');
    if(fs.existsSync(hookFile)){
      fse.removeSync(hookFile);
      console.log("existing hookfile");
    }
    else{console.log("no existing hookfile");}
    fse.copySync(path.join(__dirname, 'pre-commit-hook'), hookFile);
    fs.chmodSync(hookFile, '744');
  });
};
