module.exports = app => {
    const express = require('express')
    const jwt = require('jsonwebtoken')
    const assert = require('http-assert')
    const router = express.Router({
        mergeParams: true
    })
    const User = require('../models/User')
    const Article = require('../models/Article')
// Import auth middleware
const authMiddleware = require('../middleware/auth')
    // Register
    router.post('/register', async (req, res) => {
        const {
            username,
            password
        } = req.body//req.body，app need to use middleware express.json
        // 1. Seach user by username if exits
        const user = await User.findOne({
            username
        })
        assert(!user, 422, 'User Exits')
        // 2. Storage
        const model = await User.create({
            username,
            password
        }) 
        res.send(model)
    })

    // login, auth login
    router.post('/login', async (req, res) => {
        const {
            username,
            password
        } = req.body
        assert(username && password, 422, 'username or password can not be empty')
        // 1. find user by username
        const user = await User.findOne({
            username
        }).select('+password')
        assert(user, 422, 'user not exits')
        // 2. auth password
        const isValid = require('bcrypt').compareSync(password, user.password)
        assert(isValid, 422, 'Wrong Password')
        // 3. res token
        const token = jwt.sign({
            _id: user._id,
            username: user.username
        }, app.get('secret'))
        res.send({
            token
        })
    })
    router.get('/userinfo', authMiddleware(), async (req, res)=> {
        const user = req.user
        res.send(user)
    })
    router.get('/articles', authMiddleware(), async (req, res) => {
        const data = await Article.find({author: req.user._id}).populate('author')
        res.send(data)
    })
    app.use('/blog/api',router)
    // error handle
    app.use(async (err, req, res, next) => {
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}