module.exports = function createDbIntegrityMode() {
    'use strict';

    const includes = require('lodash/includes')

    const READONLY = "READONLY"
    const OVERWRITE = "OVERWRITE"

    const availableValues = [
        READONLY,
        OVERWRITE
    ]

    const defaultValue = READONLY;

    let currentValue = defaultValue;

    return {
        READONLY: READONLY,
        OVERWRITE: OVERWRITE,
        get: (req, res) => {
            res.send({
                availableValues: availableValues,
                defaultValue: defaultValue,
                dbIntegrityMode: currentValue
            })
        },
        put: (req, res) => {
            if (!includes(availableValues, req.body.dbIntegrityMode)) {
                res.status(400)
                res.send({
                    "error": req.body.dbIntegrityMode + " is no valid dbIntegrityMode"
                })
                return;
            }
            currentValue = req.body.dbIntegrityMode;
            res.send({})
        },
        currentValue: () => {
            return currentValue
        }
    }
}
