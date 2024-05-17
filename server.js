require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const app = express();
const expressLayouts = require('express-ejs-layouts')
const Sentry = require('./libs/sentry')

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

app.set('view engine', 'ejs')

app.use(expressLayouts)
app.use(logger('dev'));
app.use(express.json());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const server = require('http').createServer(app)
const io = require('./libs/socket')(server)

app.use((req,res,next) => {
    req.io = io
    next()
})

const routes = require('./routes')
app.use('/api/v1', routes)

app.use(Sentry.Handlers.errorHandler())

// 500 error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: false,
        message: err.message,
        data: null
    });
});

// 404 error handler
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        message: `are you lost? ${req.method} ${req.url} is not registered!`,
        data: null
    });
});

const {PORT} = process.env
server.listen(PORT, () => console.log('Server is listening on port', PORT))