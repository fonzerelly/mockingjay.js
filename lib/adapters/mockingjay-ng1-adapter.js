angular.module('Mockingjay', [])
    .factory('MockingjayInterceptor', [
        'MockingjaySettings',
        '$sce',
        function(settings, $sce) {

            function isIncluded(url) {
                return settings.includingUrls.reduce(function(matchedYet, urlRegex) {
                    return matchedYet || url.match(urlRegex);
                }, false);
            }
            function isExcluded(url) {
                return settings.excludingUrls.reduce(function(matchedYet, urlRegex) {
                    return matchedYet || url.match(urlRegex);
                }, false);
            }
            function isInterceptable(url) {
                return isIncluded(url) && !isExcluded(url)
            }

            return {
                request: function(config) {
                    var url = (typeof config.url === 'string') ?
                                config.url:
                                $sce.getTrustedUrl(config.url)

                    if (isInterceptable(url)) {
                        config.url = [
                            settings.baseUrl,
                            settings.port? ':'+settings.port: '',
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
