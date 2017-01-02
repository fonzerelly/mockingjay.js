const rewire = require('rewire')

const server = rewire('./index.js')

const mylog = console.log.bind(console);
const mockConsole = jasmine.createSpyObj('mockConsole', [
    'info',
    'error',
    'log'
]);
mockConsole.log.and.callFake(console.log.bind(console));

server.__set__({
    console: mockConsole
})

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
chai.use(chaiHttp)

describe('server', () => {
    'use strict';
    const port = 3000

    describe('dbIntegrityMode', () => {
        const db = {};
        let instance;
        afterEach(() => {
            instance.close();
        });

        it('should get possible value, default value and current value', (done) => {
            instance = server.init(db, port);
            chai.request(instance)
                .get('/dbIntegrityMode')
                .end((err, res) => {
                    expect(err).toBeNull()
                    res.should.have.status(200);
                    res.body.should.deep.equal({
                        "availableValues": [
                            "READONLY",
                            "OVERWRITE"
                        ],
                        "defaultValue": "READONLY",
                        "dbIntegrityMode": "READONLY"
                    })
                    done();
                });
        });

        it('should put provided value', (done) => {
            instance = server.init(db, port);
            chai.request(instance)
                .put('/dbIntegrityMode')
                .send({dbIntegrityMode: 'OVERWRITE'})
                .end((err, res) => {
                    expect(err).toBeNull()
                    res.should.have.status(200)

                    chai.request(instance)
                        .get('/dbIntegrityMode')
                        .end((err, res) => {
                            res.body.dbIntegrityMode.should.equal('OVERWRITE')
                            done()
                        })
                })
        });
    });
});
