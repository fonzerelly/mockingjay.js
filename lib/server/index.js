const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')


function appendRoute (server, route, service) {
    server.get(route, service.get);
    server.put(route, service.put);
}

module.exports = {
    init: (db, port) => {
        'use strict';

        const server = jsonServer.create()
        const middlewares = jsonServer.defaults()

        server.use(jsonServer.bodyParser);

        const dbIntegrityMode = require('./db-integrity-mode')();
        appendRoute(server, '/dbIntegrityMode', dbIntegrityMode)
        const router = require('./router')(db, dbIntegrityMode)

        server.use(middlewares)
        server.use(router)
        const httpServer = server.listen(port, () => {
            console.info(fs.readFileSync(path.join(__dirname, 'startup-image.ascii'), 'utf8'))
            console.info('MOCKINGJAY running at http://localhost:' + port)
        });

        server.close = () => {
            httpServer.close();
        }

        return server;
    }
}
