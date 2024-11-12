var express = require('express');
var rss = require('./routes/rss.js');
var api = require('./routes/api.js');
var app = express();

app.use(express.static(__dirname + '/public'));

app.use('/rss', rss);

app.use('/api', api);

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function () {
    console.log("App running on "  + app.get('port'))
});
