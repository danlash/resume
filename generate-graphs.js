var handlebars = require('handlebars');
var less = require('less');
var fs = require('fs');
var _ = require('underscore');

var bio = require('./bio');
var projects = require('./projects');
var technologies = require('./technologies');

var lessSource = fs.readFileSync('./graphs.less').toString();
var htmlSource = fs.readFileSync('./graphs.html.tmpl').toString();

handlebars.registerPartial('nav', fs.readFileSync('./nav.html.tmpl').toString());

var languages = _.filter(technologies, function(technology){
  return technology.type === 'language';
});

var languageDistribution = _.map(languages, function(language){
  var name = language.name;
  var count = _.filter(projects, function(project){ return project.technologies.indexOf(language.name) >= 0; }).length;
  return { name: name, count: count };
});

languageDistribution = _.sortBy(languageDistribution, function(language){ return language.count; });

less.render(lessSource, {compress:true}, function (err, css) {
  if (err) throw err;

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { 
    bio: bio,
    languages: languages,
    languageDistribution: languageDistribution
  };

  var result = template(data);

  fs.writeFileSync('./graphs.html', result);
});
