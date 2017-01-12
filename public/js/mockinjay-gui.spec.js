require ('../../lib/adapters/mockingjay-ng1-adapter')
require ('./mockingjay-gui')

describe('Mockingjay.GUI', () => {
    'use strict';
    beforeEach(ngModule('Mockingjay.GUI'))

    describe('mjayDbIntegrityMode', () => {
        let elem
        beforeEach(inject(($httpBackend, $compile, $rootScope) => {
            $httpBackend.whenGET('/dbIntegrityMode')
                .respond(200, {
                  "availableValues": [
                    "READONLY",
                    "OVERWRITE"
                  ],
                  "defaultValue": "READONLY",
                  "dbIntegrityMode": "READONLY"
                })

            elem = $compile(
                '<mjay-db-integrity-mode></mjay-db-integrity-mode>'
            )(
                $rootScope
            )
            $rootScope.$digest()
            $httpBackend.flush()
            $rootScope.$digest()
        }))

        it('should render all available states as radio buttons', () => {
            expect(elem.find('input').length).toEqual(2)
        })

        it('should put change on click', inject(($httpBackend) => {
            $httpBackend.expectPUT('/dbIntegrityMode', {dbIntegrityMode:'OVERWRITE'})
                .respond(200, {})
            angular.element(
                elem.find('input')[1]
            ).triggerHandler('click')
            $httpBackend.flush()
        }))
    })


    describe('mjayUrlInput', () => {
        const aUrl = 'http://my-rest-service.de'

        let elem
        beforeEach(inject(($compile, $rootScope, $httpBackend) => {
            elem = $compile('<mjay-url-input></mjay-url-input>')($rootScope)

            angular.element(elem.find('input')[0]).val(aUrl).triggerHandler('input')
            $rootScope.$digest()
        }))

        it('should request the url passed into input field', inject(($httpBackend, $http, $location) => {
            const baseUrl = `${$location.protocol()}://${$location.host()}:${$location.port()}`
            $httpBackend.expectGET(baseUrl + '/urls/' + encodeURIComponent(aUrl))
                .respond(200, {})

            elem.find('form').triggerHandler(
                'submit'
            )
            $httpBackend.flush()
        }))

        it('should display resulting data', inject(($httpBackend, $http, $location) => {
            const baseUrl = `${$location.protocol()}://${$location.host()}:${$location.port()}`
            const mockData = {foo: 'bar'}
            $httpBackend.whenGET(baseUrl + '/urls/' + encodeURIComponent(aUrl))
                .respond(200, mockData)

            elem.find('form').triggerHandler(
                'submit'
            )
            $httpBackend.flush()

            expect(elem.find('div').text()).toEqual(JSON.stringify(mockData))
        }))
    })
})
