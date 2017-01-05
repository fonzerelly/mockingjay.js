angular.module('Mockingjay', [])
    .factory('MockingjayInterceptor', [
        'MockingjaySettings',
        '$sce',
        function(settings, $sce) {

            function isInterceptable(url) {
                return settings.urls.reduce(function(matchedYet, urlRegex) {
                    return matchedYet || url.match(urlRegex);
                }, false);
            }

            return {
                request: function(config) {
                    var url = (typeof config.url === 'string') ?
                                config.url:
                                $sce.getTrustedUrl(config.url)

                    if (isInterceptable(url)) {
                        config.url = [
                            'http://localhost:',
                            settings.port,
                            '/urls/',
                            encodeURIComponent(
                                config.url
                            )
                        ].join('');
                    }
                    return config;
                }
            }
        }
    ])
    .config([
        '$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('MockingjayInterceptor');
        }
    ])
