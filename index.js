#!/usr/bin/env node

require('./lib/polyfills.js');

const program = require('commander');
const { generateAll, generateEntity, generateRepo, generateRest } = require('./lib/generate');

program
    .command('repo <name>')
    .alias('r')
    .description('Generate a repository')
    .action(generateRepo);

program
    .command('entity <name>')
    .alias('e')
    .description('Generate an entity')
    .action(generateEntity);

program
    .command('rest <name>')
    .alias('rc')
    .description('Generate a rest controller')
    .action(generateRest);

program
    .command('all <name>')
    .alias('a')
    .description('Generate entity, rest controller and repository')
    .action(generateAll);


program.parse(process.argv);