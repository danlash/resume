var handlebars = require('handlebars');
var less = require('less');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var templatePath = function(file) { return path.join(__dirname, '../templates', file || ''); };
var publicPath = function(file) { return path.join(__dirname, '../public', file || ''); };
var dataPath = function(file)  { return path.join(__dirname, '../data', file || ''); };

var bio = require(dataPath('bio'));
var projects = require(dataPath('projects'));
var technologies = require(dataPath('technologies'));

var lessSource = fs.readFileSync(templatePath('graphs.less')).toString();
var htmlSource = fs.readFileSync(templatePath('graphs.html.tmpl')).toString();

handlebars.registerPartial('nav', fs.readFileSync(templatePath('nav.html.tmpl')).toString());

var languages = _.filter(technologies, function(technology){
  return technology.type === 'language';
});

var languageDistribution = _.map(languages, function(language){
  var name = language.name;
  var count = _.filter(projects, function(project){ return project.technologies.indexOf(language.name) >= 0; }).length;
  return { name: name, count: count };
});

languageDistribution = _.sortBy(languageDistribution, function(language){ return language.count; });

var parser = new(less.Parser)({ paths: templatePath(), filename: 'graphs.less' });

parser.parse(lessSource, function (err, tree) {
  if (err) throw err;
  var css = tree.toCSS({compress: true});

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);

  var data = { 
    bio: bio,
    languages: languages,
    languageDistribution: languageDistribution
  };

  var result = template(data);

  fs.writeFileSync(publicPath('graphs.html'), result);
});

