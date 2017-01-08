var server = require('../server')
var wrapDb = require('../db')
var fs = require('fs')
var path = require('path')
var isUndefined = require('lodash/isUndefined')
var template = require('lodash/template')

const printHelp = () => {
    console.info(
        fs.readFileSync(
            path.join(
                __dirname,
                'help.txt'
            ),
            'utf8'
        )
    )
}

const setDefaults = (argv) => {
    argv.db = argv.db || './db.json'
    argv.port = argv.port || 3000
}

const informAboutDbCreation = (db) => {
    'use strict';
    // wrapDb will create the database file
    // if the files does not exist.

    let message = ''
    try {
        fs.accessSync(db, fs.F_OK)
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
        const dbPath = (path.isAbsolute(db)) ?
                    db :
                    path.normalize(path.join(process.cwd(), db))
        message = `Created new database at ${dbPath}`
    }
    return message
}

const renderTemplate = template(
    fs.readFileSync(
        path.join(
            __dirname,
            'splash.tpl.txt'
        ),
        'utf8'
    )
)

module.exports = {
    main: function main (argv) {
        if (!isUndefined(argv.help)) {
            printHelp()
            return
        }

        setDefaults(argv)

        argv.message = informAboutDbCreation(argv.db)

        server.init(wrapDb.wrapDb(argv.db), argv.port, () => {
            console.info(
                renderTemplate(argv)
            )
        })
    }
}
