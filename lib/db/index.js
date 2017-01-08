//
(function () {
    'use strict';
    const _ = require('lodash');
    const low = require('lowdb');
    const fileSync = require('lowdb/lib/file-sync');
    const validateData = require('json-server/lib/server/router/validate-data.js');

    const inMemoryOnly = (source) => {
        const db = low();
        db.setState(source);
        return db;
    }

    const fileBased = _.partial(low, _, {storage: fileSync, writeOnChange: true})

    module.exports = {
        wrapDb: _.memoize(function wrapDb(source) {
            return (_.isObject(source))?
                inMemoryOnly(source):
                fileBased(source)
        })
    }
}())
