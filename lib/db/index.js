//
(function () {
    'use strict';
    const _ = require('lodash');
    const low = require('lowdb');
    const fileAsync = require('lowdb/lib/file-async');
    const validateData = require('json-server/lib/server/router/validate-data.js');

    const inMemoryOnly = (source) => {
        const db = low();
        db.setState(source);
        return db;
    }

    const fileBased = _.partial(low, _, {storage: fileAsync})

    module.exports = _.memoize(function wrapDb(source) {
        return (_.isObject(source))?
            inMemoryOnly(source):
            fileBased(source)
    });
}())
