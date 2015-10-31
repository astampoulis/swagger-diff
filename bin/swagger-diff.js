#!/usr/bin/env node
'use strict';

var fs = require('fs');
var program  = require('commander');
var chalk    = require('chalk');
var jsonfile = require('jsonfile');
var reporter = require('../lib/reporter');
var api      = require('../lib');
var config   = require('../lib/constants');


program.swaggerDiff('swagger-diff <oldSpec> <newSpec>')
  .description('Compute diff bewteen two Swagger 2.0 specs')
  .option('-o, --outfile <filename>', 'The output file, otherwise diff is printed on stdout')
  .option('-f, --outformat <format>', 'The output format, either json or raw, default is json')
  .option('-c, --config  <config>', 'The config file, default is ' + config.DEFAULT_CONFIG_PATH)
  .action(function(oldSpec, newSpec, options) {
    if (!oldSpec) {
      errorHandler(new Error('oldSpec file path is missing'));
    }
    if (!newSpec) {
      errorHandler(new Error('newSpec file path is missing'));
    }
    api.swaggerDiff(oldSpec, newSpec, options.config || config.DEFAULT_CONFIG_PATH)
      .then(function(diff) {
        if (options.outfile) {
          if (options.format === 'raw') {
            fs.writeFile(options.outfile, reporter(diff), function(err) {
              if(err) {
                console.log('Something went wrong when writting output in %s', options.outfile);
                errorHandler(err);
              }
              console.log('Diff file (raw) created %s', options.outfile);
            });
          } else {
            jsonfile.writeFile(options.outfile, diff, function(err) {
              if (err) {
                console.log('Something went wrong when writting output in %s', options.outfile);
                errorHandler(err);
              }
              console.log('Diff file (json) created %s', options.outfile);
            });
          }
        }
        else {
          console.log(reporter(diff));
        }
      })
      .catch(errorHandler);
  });


// Show help if no options were given
if (program.rawArgs.length < 3) {
  program.help();
}

/**
 * Writes error information to stderr and exits with a non-zero code
 * @param {Error} err
 */
function errorHandler(err) {
  console.error(chalk.red(err.stack));
  process.exit(1);
}
