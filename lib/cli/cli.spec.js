const rewire = require('rewire')
const main = rewire('./index')
const fs = require('fs')

const mockServer = jasmine.createSpyObj('mockServer', [
    'init'
])

const mockWrapDb = jasmine.createSpyObj('mockWrapDb', [
    'wrapDb'
])
const wrapDb = require('../db')
mockWrapDb.wrapDb.and.returnValue({})

const mockFs = jasmine.createSpyObj('mockFs', [
    'accessSync',
    'readFileSync'
])

const mylog = console.log.bind(console);
const mockConsole = jasmine.createSpyObj('mockConsole', [
    'info',
    'error',
    'log'
]);
mockConsole.log.and.callFake(console.log.bind(console));

main.__set__({
    server:  mockServer,
    wrapDb:  mockWrapDb,
    fs:      mockFs,
    console: mockConsole
})

describe('Command Line Interface', () => {
    afterEach(() => {
        mockServer.init.calls.reset()
        mockWrapDb.wrapDb.calls.reset()
        mockConsole.info.calls.reset()
    })

    describe('when both arguments get passed', () => {
        const argv = {
            db: './db.json',
            port: '3000'
        }

        beforeEach(() => {
            main.main(argv)
        })

        it('should start server with passed paramters', () => {
            expect(mockServer.init).toHaveBeenCalledWith(
                jasmine.any(Object),
                argv.port,
                jasmine.any(Function)
            )
        })

        it('should wrap passed db filename to a real db', () => {
            expect(mockWrapDb.wrapDb).toHaveBeenCalledWith(argv.db)
        })
    })

    describe('when no port gets passed', () => {
        beforeEach(() => {
            main.main({
                db: './db.json'
            })
        })

        it('should use the default port 3000', () => {
            expect(mockServer.init).toHaveBeenCalledWith(
                jasmine.any(Object),
                3000,
                jasmine.any(Function)
            )
        })
    })

    describe('when no db gets passed', () => {
        beforeEach(() => {
            main.main({
                port: 3000
            })
        })

        it('should be called with default file name in current working directory', () => {
            const defaultFileName = './db.json'
            expect(mockWrapDb.wrapDb).toHaveBeenCalledWith(
                defaultFileName
            )
        })
    })

    describe('output', () => {
        it('should output help file', () => {
            mockFs.readFileSync.and.returnValue('Help Text')
            main.main({help:null})
            expect(mockConsole.info).toHaveBeenCalledWith('Help Text')
            expect(mockServer.init).not.toHaveBeenCalled()
        })

        it('should print logo, port and db file from callback', () => {
            mockFs.accessSync.and.callFake(() => {
                const e = new Error('ENOENT: no such file or directory')
                e.code = 'ENOENT'
                throw e;
            })

            //reading template
            mockFs.readFileSync.and.callFake(fs.readFileSync.bind(fs))

            mockServer.init.and.callFake((db, port, cb) => {
                cb()
            })

            main.main({})
            const output = mockConsole.info.calls.argsFor(0)
            expect(output).toMatch(/db.json/)
            expect(output).toMatch(/3000/)
            expect(output).toMatch(/Created new database at/)

        })
    })
})
