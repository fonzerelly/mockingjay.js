const request = require('superagent');
const _ = require('lodash/fp');

module.exports = function getMockingjayRouter(db, dbIntegrityMode) {
    const jsonServer = require('json-server')
    const router = jsonServer.router(db)

    const realUrl = _.flow(
        _.property('url'),
        _.drop(1),
        _.join(''),
        decodeURIComponent
    );

    router.render = (req, res) => {
        if (dbIntegrityMode.currentValue() === dbIntegrityMode.OVERWRITE) {
            request
                .get(realUrl(req))
                .end((err, realRes) => {
                    if (err) {
                        throw err;
                    }
                    res.status(realRes.status)
                    res.send(realRes.body)
                })
        } else {
            res.jsonp(res.locals.data)
        }
    }

    return router
}
