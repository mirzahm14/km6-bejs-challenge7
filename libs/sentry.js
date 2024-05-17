const Sentry = require('@sentry/node')
const app = require('express')

const {ENV, SENTRY_DSN} = process.env

Sentry.init({
    environment: ENV,
    dsn: SENTRY_DSN,
    integrations: [
        // enable http calls tracing
        new Sentry.Integrations.Http({tracing: true}),
        //enable express.js middleware tracing
        new Sentry.Integrations.Express({app})
    ],
    tracesSampleRate: 1.0 //Capture 100% of the transactions
})

module.exports = Sentry