var path = require('path');

exports.templatePath = function(file) { return path.join(__dirname, '../templates', file || ''); };
exports.publicPath = function(file) { return path.join(__dirname, '../public', file || ''); };
exports.dataPath = function(file)  { return path.join(__dirname, '../data', file || ''); };
