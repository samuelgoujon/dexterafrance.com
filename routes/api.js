var express = require('express');
var db = require('../utils/db.js');

var router = express.Router();

router.get('/feeds', function (req, res) {
    db.getAll((e, d) => {
        if (e) {
            res.jsonp([])
        } else {
            res.jsonp(d)
        }
    })
})

module.exports = router;