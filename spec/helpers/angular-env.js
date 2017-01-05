const jsdom = require('jsdom').jsdom

global.document = jsdom('<html><head><script></script></head><body></body></html>')
global.window = global.document.defaultView;
const navigator = {}
global.navigator = navigator
global.window.navigator = navigator
global.Node = window.Node

global.window.jasmine = jasmine
global.window.beforeEach = beforeEach
global.window.afterEach = afterEach

require('angular/angular')
require('angular-mocks')

global.angular = window.angular
global.inject = global.angular.mock.inject
global.ngModule = global.angular.mock.module
