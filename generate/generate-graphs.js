var handlebars = require('handlebars');
var less = require('less');
var fs = require('fs');
var _ = require('underscore');

var paths = require('./paths'), templatePath = paths.templatePath, publicPath = paths.publicPath, dataPath = paths.dataPath;

var bio = require(dataPath('bio'));
var projects = require(dataPath('projects'));
var technologies = require(dataPath('technologies'));
var employers = require(dataPath('employers'));

var lessSource = fs.readFileSync(templatePath('graphs.less')).toString();
var htmlSource = fs.readFileSync(templatePath('graphs.html.tmpl')).toString();

handlebars.registerPartial('nav', fs.readFileSync(templatePath('nav.html.tmpl')).toString());

var languages = _.filter(technologies, function(technology){
  return technology.type === 'language';
});

var languageDistribution = _.map(languages, function(language){
  var name = language.name;
  var projectsUsing = _.filter(projects, function(project){ return project.technologies.indexOf(language.name) >= 0; });
  var count = projectsUsing.length;
  var projectWeight = _.reduce(projectsUsing, function(total, project){ return project.size + total; }, 0);
  var weightedCount = projectWeight * count;
  return { name: name, count: count, weightedCount: weightedCount };
});

languageDistribution = _.sortBy(languageDistribution, function(language){ return language.count; });

var months = function(startStop) { 
  var start = new Date(startStop.start);
  var end = new Date(startStop.end);
  var spanMilliseconds = end - start;
  var months = spanMilliseconds / 1000 / 60 / 60 / 24 / 30;
  return months;
};

var averageEmploymentDurationMonths = Math.ceil(_.reduce(employers, function(current, employer){ return current + months(employer); } ,0) / employers.length);
var minEmploymentDurationMonths = Math.ceil(months(_.min(employers, function(employer){ return months(employer); })));
var maxEmploymentDurationMonths = Math.ceil(months(_.max(employers, function(employer){ return months(employer); })));


function sortAscending(collection) {
  return _.sortBy(collection, function(item){
    return (new Date(item.start)).toISOString();
  });
}

var sortedEmployers = sortAscending(employers);

var nonLanguages = _.filter(technologies, function(technology){
    return technology.type !== 'language';
  });

var parser = new(less.Parser)({ paths: templatePath(), filename: 'graphs.less' });
parser.parse(lessSource, function (err, tree) {
  if (err) throw err;
  var css = tree.toCSS({compress: true});

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);

  var data = { 
    bio: bio,
    languages: languages,
    languageDistribution: languageDistribution,
    employmentMonths: {
      average: averageEmploymentDurationMonths,
      min: minEmploymentDurationMonths,
      max: maxEmploymentDurationMonths
    },
    sortedEmployers: sortedEmployers,
    nonLanguages: nonLanguages
  };

  var result = template(data);

  fs.writeFileSync(publicPath('graphs.html'), result);
});

