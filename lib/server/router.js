const request = require('superagent');
const _ = require('lodash/fp');
const express = require('express');

encodeUrl = _.flow(
    encodeURIComponent,
    _.replace(/\./g, '%2E')
)

const createUrl = (db, key) => {
    const router = express.Router()
    router.route('/')
        .get(() => { return db.get([key,'GET'].join('.')).value() })
        .post(() => { return db.get([key,'POST'].join('.')).value() })
        .put(() => { return db.get([key,'PUT'].join('.')).value() })
        .delete(() => { return db.get([key, 'DELETE'].join('.')).value()})
    return router;
}

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

    db.forEach((value, key) => {
        const sub = express.Router()
        sub.route('/').get((req, res, next) => {
            res.locals.data = db.get(key).value()
            next()
        })
        router.use('/'+ key, sub)
    }).value()

    router.render = (req, res) => {
        if (dbIntegrityMode.currentValue() === dbIntegrityMode.OVERWRITE) {
            const uri = uriFromReq(req)
            request
                .get(decodeURIComponent(uri))
                .end((err, realRes) => {
                    if (err) {
                        throw err;
                    }
                    res.status(realRes.status)
                    res.send(realRes.body)

                    db.set(uri, realRes.body).value()
                })
        } else {
            res.jsonp(res.locals.data)
        }
    }

    router.use((req, res) => {
        if (!res.locals.data) {
            res.status(404)
            res.locals.data = {}
        }
        router.render(req, res)
    })

    return router
}
