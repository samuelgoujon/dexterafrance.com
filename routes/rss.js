var express = require('express');
var RSS = require('rss');
var db = require('../utils/db');

var router = express.Router();

router.get('/', function (req, res) {
    var feed = new RSS({
        title: 'dexterafrance.com',
        description: 'Dextera rss feed',
        site_url: 'http://dexterafrance.com/',
        feed_url: 'http://dexterafrance.com/rss',
        copyright: new Date().getFullYear() + ' Dexterafrance',
        pubDate: new Date()
    })

    db.getAll((err, data) => {
        if (err) {
            return res.status(400).send('Unexpected error')
        }

        data
        .sort((a, b) => {
            return new Date(b.published) - new Date(a.published)
        })
        .forEach(d => {
            feed.item({
                title:  d.title,
                description: d.description,
                url: d.link,
                author: d.node,
                date: d.published
            })
        })

        res.header('Content-Type', 'text/xml')
           .send(feed.xml({ indent: true }))
    })
    
})

module.exports = router;