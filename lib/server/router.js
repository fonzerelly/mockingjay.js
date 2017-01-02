const request = require('superagent');
const _ = require('lodash/fp');

module.exports = function getMockingjayRouter(db, dbIntegrityMode) {
    const jsonServer = require('json-server')
    const router = jsonServer.router(db)

    const uriFromReq = _.flow(
        _.property('url'),
        _.drop(1),
        _.join('')
    );

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

                    router.db.set(uri, realRes.body).value()
                })
        } else {
            res.jsonp(res.locals.data)
        }
    }

    return router
}
