#!/usr/bin/env node

require('./lib/text.js');

const program = require('commander');
const {
    generateEntity,
    generateRepo,
    generateRest,
    generateProperties,
    importSwagger,
    init
} = require('./lib/generate');

program
    .description('First, move into the directory where your pom.xml is located')

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
    .command('ctrl <name>')
    .alias('c')
    .description('Generate a rest controller')
    .action(generateRest);

program
    .command('prop')
    .alias('p')
    .description('Default application.properties file to use JPA')
    .action(generateProperties);

program
    .command('swagger')
    .alias('s')
    .description('Import swagger')
    .action(importSwagger);

program
    .command('init')
    .alias('i')
    .description('Import swagger & init properties')
    .action(init);

program.parse(process.argv);