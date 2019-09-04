const jwt = require('jsonwebtoken')
const assert = require('http-assert')
const User = require('../models/User')
module.exports = option => {
    return async (req, res, next) => {
        assert(req.headers.authorization, 401, 'ログインしてください')
        const token = (String(req.headers.authorization) || '').split(' ').pop()
        const {
            _id
        } = jwt.verify(token, req.app.get('secret'))
        assert(_id, 401, 'ログインしてください')
        req.user = await User.findById(_id)
        assert(req.user, 401, 'ログインしてください')
        await next()
    }
}