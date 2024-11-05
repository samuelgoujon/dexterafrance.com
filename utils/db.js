var csv = require("csvtojson");
var mongojs = require('mongojs')
var feedRead = require('./feed-read');
var keywords = require('./keywords');
var axios = require('axios');

var url = 'mongodb://heroku_4q530qcp:85d95dv3hkim121ja667jnd79c@ds117423.mlab.com:17423/heroku_4q530qcp';

var csvFilePath = './public/data/dextera_orgs.csv';

var db = mongojs(url, ['dextera']); // remote db
// var db = mongojs('dextera'); // local db

function writeFeedsToDatabase () {
    csv()
        .fromFile(csvFilePath)
        .then(data => {
            var rssUrls = data.filter(x => x.rss.trim().length)
                .map(x => {
                    return {
                        url: x.rss.trim(),
                        node: x.node
                    }
                })

            // remove all feeds before write new items
            db.feeds.remove(function(){
                for(let i = 0; i < rssUrls.length; i++) {
                        let url = rssUrls[i].url;
                        let node = rssUrls[i].node;

                        axios.get(url,
                            {
                                params: {
                                    timeout: 5000,
                                    headers: {
                                        "Accept": "application/json, text/plain, */*",
                                        "User-Agent": "axios/0.18.0"
                                    }
                                }
                            })
                        .then(d => {
                            var type = feedRead.identify(d.data)
                            //console.log(type)
                            if (type == "rss") {
                                feedRead.rss(d.data, url, (err, res) => {
                                    if (res && res.length)
                                        writeSingle(res, url, node)
                                })
                            } else if (type == "atom") {
                                feedRead.atom(d.data, url, (err, res) => {
                                    if (res && res.length)
                                        writeSingle(res, url, node)
                                })
                            } else {
                                console.log("not type:" + url, d.data.substring(0, 100))
                            }
                        })
                        .catch(function (error) {
                            console.log(error.message);
                            console.log("failed: " + url)
                        });
                }
            })

        })
}

function testReader () {
    axios.get('https://francais.rt.com/rss',
        {
            params: {
                timeout: 5000,
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "User-Agent": "axios/0.18.0"
                }
            }
        })
        .then(d => {
            feedRead.rss(d.data, url, (err, res) => {
                console.log(res)
            })
        })
}

function titlesContainingKeywords(res) {
    return res.filter(x => {
        let matches = false;
        keywords.words.forEach(k => {
            if (matchKeyword(x.title.toLowerCase(), k)) {
                matches = true;
            }
        })
        return matches;
    })
}

function matchKeyword (str, keyword) {
    var r = new RegExp(`\\b${stripAccents(keyword)}\\b`)
    return r.test(stripAccents(str))
}

function stripAccents(str) {
    var reAccents = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
    var replacements = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY';
    return str.replace(reAccents, function (match) {
        return replacements[reAccents.source.indexOf(match)];
    });
}

function writeSingle(res, url, node) {
    res = titlesContainingKeywords(res)
    res = res.map(d => {
        return {
            title: d.title,
            description: d.description,
            image: d.enclosure,
            source: url,
            node: node,
            published: d.published,
            link: d.link
        }
    })
    if (res.length) {
        db.feeds.insert(res);
        console.log(`${res.length} items added to the database!`)
    }
}

function getAll(callback) {
    var all = db.feeds.find().toArray((err, res) => {
        if (err) {
            callback(err)
        }
        callback(null, res);
    })
}

module.exports = {
  getAll,
  writeFeedsToDatabase
}
