const server = require('./index.js')

const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
chai.use(chaiHttp)

describe('server', () => {
    const port = 3000

    describe('dbIntegrityMode', () => {
        it('should provide possible value, default value and current value', (done) => {
            const db = {};
            chai.request(server.init(db, port))
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
                        "currentValue": "READONLY"
                    })
                    done();
                });
        });
    });
});
