# Mockingjay

## When should you use Mockingjay
Did you ever created client centric apps like
React or Angular apps, that depend on a complex
set of REST-Services, that you can not simply
mock by creating a database in the same format
and fill it with testing data.

But you still want to have your test suite running
properly with a fixed data set, so that you
can rely on its results and write simple assertions.


## Why no random fixtures?
Depending on how complex and entangled your REST
data is, you might get a way with a combination
of [json-server](https://github.com/typicode/json-server)
and [factory-girl](https://github.com/aexmachina/factory-girl)

However, I was confronted with highly entangled data
which was hard to autogenerate with factory-girl or other
mock data generators. My Rest responses needed to
share IDs accross several object literals and after
I implemented it with a mock data generator, I figured
it would be too hard to maintain it like that.

## What is the basic idea?
So how can you generate highly complex but properly entangled
mock data? You get it from real data of your servers.
But setting up such complex system on each development machine
can be a harsh pain in the ass. But you still need a source of
mock data that you are controll of its changes and that are still
available if your complex REST-System is down.

Mockingjay now gives you the opportunity to record
the REST-calls and their results in a tiny express based
node server as long as your production system is available
by simply running your test suite.
And use the prerecorded data when your production system
might be offline or is changing its interface.

## Setup

To install Mockingjay simply install it via npm:
`
npm install mockingjay.js --save-dev
`
Now you can start it by adding it as script to your package.json
`
...
"scripts": {
    "mockingjay": "mockingjay",
    ...
}
`
and start it by npm:
`
npm run mockingjay
`
By default mockingjay awaits a db.json-file and
runs on port 3000. But you can define this also
by its cli.
`
npm run mockingjay --db myDb.json --port 1234
`


### Angular 1 Adapter
If you are working with Angular 1 you
can simply use the provided $http-Interceptor
that you can find in
<mockingjay installation dir>/lib/adapters/mockingjay-ng1-adapter.js

If you include this script into your build and
make it a dependency of your angular app:
`
angular.module('myApp', ['Mockingjay'])
    .constant('MockingjaySettings', {
            baseUrl: 'http://localhost',
            port: 3000,
            includingUrls: [
               <regexes matching urls>
            ],
            excludingUrls: [
                <regexes matching ulrs>
            ]
    })
`
Now all urls that match on of the regexes defined
in includingUrls will be redirected to mockingay.
All Urls matching also excludingUrls will not be
redirected to Mockingjay.

### If an adapter for your favorite framework is still missing
You can simply redirect urls by yourself if your
favorite framework is not yet supported (looking forward
to your pull requests :).
You call your mockingjay instance with the (encodedURIComponent)[http://www.w3schools.com/jsref/jsref_encodeuricomponent.asp]
version of the url you want to be recorded by mockingjay:
`
http://localhost:3000/urls/http%3A%2F%2Fmy-rest-service
`

## Record by testing
Now you can set Mocksettings set into recording
mode by putting {"dbIntegrityMode": "OVERWRITE"}
to
`
http://localhost:3000/dbIntegrityMode
`
and run a suite of tests that call your complex
REST-System and afterwards db.json will contain
all your mockdata. Mockingjay supports all sorts
of REST-verbs (GET, PUT, POST, DELETE)



