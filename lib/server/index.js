const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')

function appendRoute (server, route, service) {
    server.get(route, service.get);
    server.put(route, service.put);
}

module.exports = {
    init: (db, port, cb) => {
        'use strict';

        const server = jsonServer.create()
        const pub = path.join(
            __dirname,
            '..',
            '..',
            'public'
        )
        const middlewares = jsonServer.defaults({
            static: pub
        })

        server.use(jsonServer.bodyParser);

        const dbIntegrityMode = require('./db-integrity-mode')();
        appendRoute(server, '/dbIntegrityMode', dbIntegrityMode)
        const router = require('./router')(db, dbIntegrityMode)

        server.use(middlewares)
        server.use(router)

        cb = cb || () => {}
        const httpServer = server.listen(port, cb);

        server.close = () => {
            httpServer.close();
        }

        return server;
    }
}
