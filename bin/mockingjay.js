#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2))
const cli = require('../lib/cli')

cli.main(argv)
