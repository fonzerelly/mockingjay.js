angular.module('Mockingjay.GUI', ['Mockingjay'])
    .directive('mjayDbIntegrityMode', () => {
        return {
            restrict: 'E',
            template: `
                <h3>Database Integrity Mode</h3>
                <div class="radio" ng-repeat="mode in data.availableValues">
                    <label >
                        <input
                            type="radio"
                            ng-value="mode"
                            ng-model="data.dbIntegrityMode"
                            id="{{mode}}"
                            ng-checked="mode === data.dbIntegrityMode"
                            ng-click="set(mode)"
                        >
                        {{mode}}
                    </label>
                </div>
            `,
            controller: ($scope, $http) => {
                'use strict';
                function update() {
                    $http.get('/dbIntegrityMode')
                        .then((response) => {
                            $scope.data = response.data
                        })
                }
                update()
                $scope.set = (mode) => {
                    $http.put('/dbIntegrityMode', {dbIntegrityMode: mode})
                        .then(update)
                    return mode === $scope.data.dbIntegrityMode
                }

            }
        }
    })
    .directive('mjayUrlInput', () => {
        return {
            template: `
                <form ng-submit="loadUrl()">
                    <input type="text" ng-model="url">
                    <input type="submit" value="Laden">
                </form>
                <div class='mjay-url-input__output' ng-bind="result"><div>
            `,
            controller: ($scope, $http) => {
                $scope.loadUrl = () => {
                    $http.get($scope.url)
                        .then(function(response) {
                            $scope.result = response.data;
                        });
                }
            }
        }
    })
    .factory('MockingjaySettings', ($location) => {
        return {
            baseUrl: [
                $location.protocol(),
                '://',
                $location.host(),
            ].join(''),
            port: $location.port(),
            includingUrls: [
                /.*/
            ],
            excludingUrls: [
                /db/
            ]
        }
    })
