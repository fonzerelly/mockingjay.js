const request = require('superagent');
const _ = require('lodash/fp');
const express = require('express');

const encodeUrl = _.flow(
    encodeURIComponent,
    _.replace(/\./g, '%2E')
)

module.exports = function getMockingjayRouter(db, dbIntegrityMode) {
    const router = express.Router()

    router.get('/db', (req, res) => {
        res.jsonp(db.getState())
    })

    const dataAccessHandler = {}
    dataAccessHandler[dbIntegrityMode.READONLY] = (url, method) => {
        return new Promise((resolve, reject) => {
            const path = [encodeUrl(url), method].join('.')
            const result = db.get(path).value()
            if (result) {
                resolve(result)
            } else {
                reject(new Error(`Response for ${url} is missing in database`))
            }
        })
    }

    dataAccessHandler[dbIntegrityMode.OVERWRITE] = (url, method) => {
        return new Promise((resolve, reject) => {
            request
                [method.toLowerCase()](url)
                .end((err, realRes) => {
                    if (err) {
                        reject(err)
                    } else {
                        const path = [encodeUrl(url), method].join('.')
                        db.set(path, realRes.body).value()
                        resolve(realRes.body)
                    }
                })
        })
    }

    router.param('url', (req, res, next, url) => {
        dataAccessHandler[dbIntegrityMode.currentValue()](url, req.method)
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

    const handleUrl = (req, res) => {
        if (!res.locals.data) {
            res.status(404)
            res.locals.data = {}
        }
        res.jsonp(res.locals.data)
    }

    router.get('/urls/:url', handleUrl)

    router.post('/urls/:url', handleUrl)

    router.put('/urls/:url', handleUrl)

    router.delete('/urls/:url', handleUrl)

    return router
}
