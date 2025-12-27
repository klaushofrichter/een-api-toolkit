# EEN API Toolkit

We are creating a library of Typescript functions ("Toolkit") that implements the EEN Video platform API.
This is supposed to be used by developers of VUE3 composition API Applications. 

Vue 3 applications typically create a ./src/services folder for this type of function. In our case, we want to
use a folder called ./src/een-api-toolkit to make the EEN API functions available to other applications. This should
give some level of isolation of that API from other parts of the 3rd party applications. 

We will need to propose a way to create a package that can be imported by other applications, ideally 
by using "npm install een-api-toolki@latest" or some similar convenient way. 

We can create a demo application for test purposes either as part of this ./. directory or in a separate 
repository.  The latter may be better to make sure that there is good isolation of the API Toolkit from
the VUE3 application that is using the ./src/een-api-toolkit

This toolkit can rely on getting an access token for API call authentication through OAuth using the
OAuth proxy and settings from ../een-oauth-proxy. A demonstration of that is in ../een-oauth-proxy/demo1 
folder. Refer to ../een-oauth-proxy/demo1/src/services for code related to auth.js and the proxy.js. There is 
also one EEN API used, that service is in user.js, which is only there for validation. You will need to replicate
the user.js service in ./een-api-toolkit, and you can replicate the other two services as well. Please reuse
the .env data and other settings from ../een-oauth-proxy/demo1, do not change any code in the ../een-oauth-proxy
folder. 

## specification and example code
* from the EEN service, we are using API 3.0 only.
* there is a API spec for the EEN API available here: https://github.com/EENCloud/api-v3-documentation/tree/development/api/3.0
* there is a developer portal with more information here: https://developer.eagleeyenetworks.com/reference/using-the-api
* additionally, there is some demonstration code of the usage of APIs here: ../een-login/src/services 
* The toolkit and the associated documentation should enable users to create applications
 
## Toolkit structure
* we want to have services that are structured in a similar way as the API.
  * most likely, we will have services like ./src/services/users.js and others in the structure of the EEN 
    API itself. You can use the EEN API spec for reference. 
* We want a complete reference implementation of all EEN APIs.
  * However, we are starting with a small subset first and iterate for more. We are starting with
    ./een-api-toolkit/users.js to get access to user data. We only implement non-destructive GET and POST 
    APIs until we explicitly expand to PUT and DELETE and PATCH. 
  * you may create ./auth.js and ./proxy.js when needed in the een-api-toolkit folder

## Branch structure
* we are using the "develop" branch for integration testing, and a "production" branch for the release
  of well tested and ready-to use packages.
* When creating new features or updates we use feature branches the are merged with "develop" before 
  going to release in "production"
* We track a single version number for the package in ./package.json
* We use husky for automatic increment of the patch version number. The minor and major number are manually
  updated. 
* we use github actions for quality control and automatic testing. Check ../een-oauth-proxy/.github for
  inspiration. We use the same SLACK_WEBHOOK to announce releases. 

## Result
* The outcome of this repository is a een-api-toolkit library that can be conveniently imported to 
  VUE 3 Composite API applications. 

## development plan
* we are creating extensive unit tests for the library
* we use ./.env for configuration 
* we use playwright for E2E test of the application
* we can rely on a locally running proxy server from ../een-oauth-proxy 
* We can create demo applications with limited scope, perhaps using only selected services. These
  will run only locally. 
* All demo applications should use port 3333 for vite. That means that only one application can run at 
  a time. When a demo application is to be launched, the launch script should automatically terminate 
  any other application that runs on port 3333. We use IP 127.0.0.1 instead of "localhost"
* We focus on robustness and readbility of the code

## AI support
* We use claude in a github workflow for code review
* You will never approve a PR

## Q&A
* Questions and answers
  ⎿  · What package manager and build tooling should we use for the library? → Vite + npm
     · How should the library be distributed and consumed by Vue 3 applications? → npm package (public)
     · What HTTP client should we use for API calls? → Native fetch
     · Should the library provide Vue 3 composables or plain functions? → Vue composables (Recommended)
* How should authentication state be managed across the library: use pinia store 
* How should API errors be handled and exposed to consuming applications: Return {data, error} objects, never throw
* What testing framework should we use for unit tests? vitest
* Should the library include request caching or rate limiting? no caching, the app manages that
* Typescript mode: strict
* Folder structure: by function (./composable, ./services, ...)
* Typescript types: generated 
* ESLint? ESLint only
 ● How should the proxy URL be configured in consuming applications?
   → Environment variable
 ● Should we include a demo application in this repository?
   → Yes, in /examples folder
 ● What Node.js version should be the minimum supported?
   → Node 20 LTS
 ● Should the library export a single entry point or multiple sub-paths?
   → Single entry point
 ● Which EEN API resources should we prioritize implementing first (after users)?
   → Bridges, then Cameras
 ● How should we handle API pagination in composables?
   → Use the same method as it is in the EEN API itself. 
 ● Should composables auto-refresh data or only fetch on demand?



