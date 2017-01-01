(() => {
    'use strict';

    const READONLY = "READONLY"
    const OVERWRITE = "OVERWRITE"

    const availableValues = [
        READONLY,
        OVERWRITE
    ]

    const defaultValue = READONLY;

    let currentValue = defaultValue;

    module.exports = {
        READONLY: READONLY,
        OVERWRITE: OVERWRITE,
        get: (req, res) => {
            res.send({
                availableValues: availableValues,
                defaultValue: defaultValue,
                currentValue: currentValue
            })
        }
    }
}())
