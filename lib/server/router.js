const request = require('superagent');
const _ = require('lodash/fp');
const express = require('express');

encodeUrl = _.flow(
    encodeURIComponent,
    _.replace(/\./g, '%2E')
)

const uriFromReq = _.flow(
    _.property('url'),
    _.drop(1),
    _.join('')
);

module.exports = function getMockingjayRouter(db, dbIntegrityMode) {
    const router = express.Router()

    router.get('/db', (req, res) => {
        res.jsonp(db.getState())
    })

    const dataAccessHandler = {}
    dataAccessHandler[dbIntegrityMode.READONLY] = (url) => {
        return new Promise((resolve, reject) => {
            const result = db.get(encodeUrl(url)).value()
            if (result) {
                resolve(result)
            } else {
                reject(new Error(`Response for ${url} is missing in database`))
            }
        })
    }

    dataAccessHandler[dbIntegrityMode.OVERWRITE] = (url) => {
        return new Promise((resolve, reject) => {
            request
                .get(url)
                .end((err, realRes) => {
                    if (err) {
                        reject(err)
                    } else {
                        db.set(encodeUrl(url), realRes.body).value()
                        resolve(realRes.body)
                    }
                })
        })
    }

    router.param('url', (req, res, next, url) => {
        dataAccessHandler[dbIntegrityMode.currentValue()](url)
            .then((result) => {
                res.locals.data = result
                next()
            })
            .catch((err) => {
                res.status(404)
                res.locals.data = {}
                next()
            })
    })

    router.get('/urls/:url', (req, res, next) => {
        if (!res.locals.data) {
            res.status(404)
            res.locals.data = {}
        }
        res.jsonp(res.locals.data)
    })

    return router
}
