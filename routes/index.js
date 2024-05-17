const { register, login, requestResetPassword, resetPassword } = require('../controllers/auth.controllers')
const { authenticateTokenQuery } = require('../middlewares/restrict')

const Router = require('express').Router()

//Views
Router.get('/register', (req,res) => {
    res.render('register', {
        layout: "layouts/main",
        title: "Register"
    })
})
Router.get('/login', (req,res) => {
    res.render('login', {
        layout: "layouts/main",
        title: "Login"
    })
})
Router.get('/forgotpassword', (req,res) => {
    res.render('forgot-password', {
        layout: "layouts/main",
        title: "Request Reset Password",
        isEmailSent: false
    })
})
Router.get('/reset-password', authenticateTokenQuery, (req,res) => {
    res.render('reset-password', {
        layout: "layouts/main",
        title: "Reset Password",
        token: req.query.token
    })
})
Router.get('/home', authenticateTokenQuery, (req,res) => {
    res.render('index', {
        layout: "layouts/main",
        title: "Home",
        user: req.user
    })
})

//users
Router.post('/register', register)
Router.post('/login', login)
Router.post('/forgotpassword', requestResetPassword)
Router.post('/reset-password', authenticateTokenQuery, resetPassword)

module.exports = Router