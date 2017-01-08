const rewire = require('rewire')
const nock = require('nock')

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

const wrapDb = require('../db')

const dbWrite = jasmine.createSpy('db.write')
const initDb = (dbObj) => {
    /* Since lowdb does not implement a write method when running it in
     * memory only, we have to mock this function
     */
    const db = wrapDb.wrapDb(dbObj)
    dbWrite.calls.reset()
    db.write = dbWrite
    return db
}

describe('server', () => {
    'use strict';
    const port = 3000

    describe('dbIntegrityMode', () => {
        const db = initDb({});
        let instance;
        afterEach(() => {
            instance.close()
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
                    done()
                })
        })

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
        })

        it('should fail on invalid value', (done) => {
            instance = server.init(db, port);
            chai.request(instance)
                .put('/dbIntegrityMode')
                .send({dbIntegrityMode: 'invalid value'})
                .end((err, res) => {
                    res.should.have.status(400)
                    expect(res.body.error).toBeDefined();

                    chai.request(instance)
                        .get('/dbIntegrityMode')
                        .end((err, res) => {
                            res.body.dbIntegrityMode.should.equal(res.body.defaultValue)
                            done()
                        })
                })
        })
    })

    describe('db datas in different modes', () => {
        const getMockData = {
            'foo': 'bar'
        }

        const postMockData = {
            'zoo': 'bar'
        }

        const getMissingMockData = {
            'bar': 'foo'
        }

        const postMissingMockData = {
            'zoo': 'foo'
        }

        let db, instance
        beforeEach(() => {
            db = initDb({
                'http%3A%2F%2Fwww%2Ealready-stored-url%2Ecom%3Fparam%3D42': {
                    'GET': getMockData,
                    'POST': postMockData
                }
            })
            instance = server.init(db, port)
            nock('http://www.not-yet-stored-url.com')
                .get('/')
                .query({
                    param: 42
                })
                .reply(200, getMissingMockData)

            nock('http://www.another-not-yet-stored-url.com')
                .post('/')
                .query({
                    param: 42
                })
                .reply(200, postMissingMockData)
        })

        afterEach(() => {
            instance.close()
        });

        describe('READONLY', () => {
            beforeEach((done) => {
                chai.request(instance)
                    .put('/dbIntegrityMode')
                    .send({dbIntegrityMode: 'READONLY'})
                    .end(done)
            })

            it('should GET http://www.already-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .get('/urls/http%3A%2F%2Fwww.already-stored-url.com%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(getMockData)
                        done()
                    })
            })

            it('should fail on GET http://www.not-yet-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .get('/urls/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        res.should.have.status(404)
                        done()
                    })
            })

            it('should return POST-Result http://www.already-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .post('/urls/http%3A%2F%2Fwww.already-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(postMockData)
                        done()
                    })
            })
        })

        describe('OVERWRITE', () => {
            beforeEach((done) => {
                chai.request(instance)
                    .put('/dbIntegrityMode')
                    .send({dbIntegrityMode: 'OVERWRITE'})
                    .end(done)
            })

            it('should GET http://www.not-yet-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .get('/urls/http%3A%2F%2Fwww.not-yet-stored-url.com%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(getMissingMockData)
                        expect(dbWrite).toHaveBeenCalled()
                        done()
                    })
            })

            it('should POST http://www.another-not-yet-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .post('/urls/http%3A%2F%2Fwww.another-not-yet-stored-url.com%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(postMissingMockData)
                        expect(dbWrite).toHaveBeenCalled()
                        done()
                    })
            })

            it('should store data in database so that a later call will not fail in READONLY mode', (done) => {
                chai.request(instance)
                    .get('/urls/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        chai.request(instance)
                            .put('/dbIntegrityMode')
                            .send({dbIntegrityMode: 'READONLY'})
                            .end((err, putRes) => {
                                chai.request(instance)
                                    .get('/urls/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                                    .end((err, res) => {
                                        expect(err).toBeNull()
                                        res.should.have.status(200)
                                        res.body.should.deep.equal(getMissingMockData)
                                        done()
                                    })
                            })
                    })
            })
        })
    })
})
