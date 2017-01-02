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

describe('server', () => {
    'use strict';
    const port = 3000

    describe('dbIntegrityMode', () => {
        const db = {};
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
        const mockData = {
            'foo': 'bar'
        }

        const missingMockData = {
            'bar': 'foo'
        }

        let db, instance
        beforeEach(() => {
            db = {
                'http%3A%2F%2Fwww%2Ealready-stored-url%2Ecom%3Fparam%3D42': {
                    'foo': 'bar'
                }
            }
            instance = server.init(db, port)
            nock('http://www.not-yet-stored-url.com')
                .get('/')
                .query({
                    param: 42
                })
                .reply(200, missingMockData)
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
                    .get('/http%3A%2F%2Fwww%2Ealready-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(mockData)
                        done()
                    })
            })

            it('should fail on GET http://www.not-yet-stored-url.com?param=42', (done) => {
                chai.request(instance)
                    .get('/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        res.should.have.status(404)
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
                    .get('/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        expect(err).toBeNull()
                        res.should.have.status(200)
                        res.body.should.deep.equal(missingMockData)
                        done()
                    })
            })

            it('should store data in database', (done) => {
                chai.request(instance)
                    .get('/http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42')
                    .end((err, res) => {
                        chai.request(instance)
                            .get('/db')
                            .end((err, dbRes) => {
                                expect(dbRes.body['http%3A%2F%2Fwww%2Enot-yet-stored-url%2Ecom%3Fparam%3D42']).toEqual(missingMockData)
                                done()
                            })
                    })
            })
        })
    })
})
