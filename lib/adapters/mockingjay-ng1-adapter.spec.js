require('./mockingjay-ng1-adapter')

describe('angular mockingjay adapter', () => {
    const configuredUrl1 = 'http://my-rest-service.com'
    const configuredUrl2 = 'http://my-other-rest-service.com'

    beforeEach(() => {
        angular.module('fixture', ['Mockingjay'])
            .constant('MockingjaySettings', {
                baseUrl: 'http://server',
                port: 3000,
                includingUrls: [
                    new RegExp(`^${configuredUrl1}`),
                    new RegExp(`^${configuredUrl2}`),
                    /allowed-url/
                ],
                excludingUrls: [
                    /non/
                ]
            })
            ngModule('fixture')
    })

    it('must not modify urls that are not configured', inject(($httpBackend, $http) => {
        const nonConfiguredUrl = 'http://www.google.com'
        $httpBackend.expectGET(nonConfiguredUrl)
            .respond(200, {})
        $http.get(nonConfiguredUrl)
        $httpBackend.flush()
    }))

    it('should reroute included url to Mockingjay', inject(($httpBackend, $http, MockingjaySettings) => {
        $httpBackend.expectGET(`${MockingjaySettings.baseUrl}:${MockingjaySettings.port}/urls/${encodeURIComponent(configuredUrl1)}`)
            .respond(200, {})
        $http.get(configuredUrl1)
        $httpBackend.flush()
    }))

    it('should support more than one configured url', inject(($httpBackend, $http, MockingjaySettings) => {
        $httpBackend.expectGET(`${MockingjaySettings.baseUrl}:${MockingjaySettings.port}/urls/${encodeURIComponent(configuredUrl2)}`)
            .respond(200, {})
        $http.get(configuredUrl2)
        $httpBackend.flush()
    }))

    it('should support trustedUrls', inject(($httpBackend, $http, MockingjaySettings, $sce) => {
        const trustedUrl = $sce.trustAsUrl(configuredUrl1)
        $httpBackend.expectGET(`${MockingjaySettings.baseUrl}:${MockingjaySettings.port}/urls/${encodeURIComponent(configuredUrl1)}`)
            .respond(200, {})
        $http.get(trustedUrl)
        $httpBackend.flush()
    }))

    it('should not reroute excluded Urls', inject(($httpBackend, $http, MockingjaySettings, $sce) => {
        const nonReroutedUrl = 'http://non-rerouted-url'
        $httpBackend.expectGET(nonReroutedUrl)
            .respond(200, {})
        $http.get(nonReroutedUrl)
        $httpBackend.flush()
    }))

    it('should not reroute included Urls that are alsoe excluded', inject(($httpBackend, $http, MockingjaySettings, $sce) => {
        const nonReroutedUrl = 'http://non-allowed-url'
        $httpBackend.expectGET(nonReroutedUrl)
            .respond(200, {})
        $http.get(nonReroutedUrl)
        $httpBackend.flush()
    }))
})
