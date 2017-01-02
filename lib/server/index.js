const jsonServer = require('json-server')


function appendRoute (server, route, service) {
    server.get(route, service.get);
    server.put(route, service.put);
}

module.exports = {
    init: (db, port) => {
        'use strict';

        const server = jsonServer.create()
        const router = jsonServer.router(db)
        const middlewares = jsonServer.defaults()

        server.use(jsonServer.bodyParser);

        const dbIntegrityMode = require('./db-integrity-mode')();
        appendRoute(server, '/dbIntegrityMode', dbIntegrityMode)

        server.use(middlewares)
        server.use(router)
        const httpServer = server.listen(port, () => {
            console.info('Mockingjay running http://localhost:' + port);
        });

        server.close = () => {
            httpServer.close();
        }

        return server;
    }
}
