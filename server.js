
var connect = require('connect');
var path = require('path');

connect.createServer(
    connect.static(path.join(__dirname, 'public'))
).listen(3000);