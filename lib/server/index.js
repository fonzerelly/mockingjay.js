const jsonServer = require('json-server')

const dbIntegrityMode = require('./db-integrity-mode');
module.exports = {
    init: (db, port) => {
        const server = jsonServer.create()
        const router = jsonServer.router(db)
        const middlewares = jsonServer.defaults()

        server.get('/dbIntegrityMode', dbIntegrityMode.get)

        server.use(middlewares)
        server.use(router)
        server.listen(port, () => {
            console.info('Mockingjay running http://localhost:' + port);
        });

        return server;
    }
}
