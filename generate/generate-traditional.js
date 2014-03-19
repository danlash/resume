var fs = require('fs');
var less = require('less');
var handlebars = require('handlebars');
var _ = require('underscore');

var paths = require('./paths'), templatePath = paths.templatePath, publicPath = paths.publicPath, dataPath = paths.dataPath;


var bio = require(dataPath('bio.json'));
var projects = require(dataPath('projects'));
var technologies = require(dataPath('technologies'));
var employers = require(dataPath('employers'));
var degrees = require(dataPath('degrees'));
var profiles = require(dataPath('profiles'));
var interests = require(dataPath('interests'));

var lessSource = fs.readFileSync(templatePath('traditional.less')).toString();
var htmlSource = fs.readFileSync(templatePath('index.html.tmpl')).toString();

handlebars.registerPartial('nav', fs.readFileSync(templatePath('nav.html.tmpl')).toString());

var technologyGroups = _.groupBy(technologies, function(technology){
  return technology.type;
});

technologyGroups = _.map(technologyGroups, function(technologies, name){
  technologies = _.sortBy(technologies, function(technology) { return technology.name.toLowerCase(); })
  return { type: name, technologies: technologies };
});

_.each(projects, function(project){
  var employer = _.find(employers, function(e) { return e.name === project.employer; });
  employer.highlights = employer.highlights || [];
  employer.highlights = employer.highlights.concat(project.highlights);

  _.each(project.technologies, function(pt){
    if (!_.find(technologies, function(t){return t.name === pt})) 
      console.log('\
  {\n\
    "name"  :       "'+pt+'",\n\
    "type"  :       "",\n\
    "proficiency" : 0,\n\
    "affinity"  :   0\n\
  },')

  });
});  

var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];


function englishizeDates(collection) {
  _.each(collection, function(item) {
    var start = new Date(item.start);
    item.start = months[start.getUTCMonth()] + ' ' + start.getUTCFullYear();
    var end = new Date(item.end);
    item.end = months[end.getUTCMonth()] + ' ' + end.getUTCFullYear();
    
  });
}

englishizeDates(employers);
englishizeDates(degrees);

function sortDescending(collection) {
  return _.sortBy(collection, function(item){
    return (new Date(item.start)).toISOString();
  }).reverse();
}

employers = sortDescending(employers);

interests = _.pluck(interests, 'name').join(', ');


var parser = new(less.Parser)({ paths: templatePath(), filename: 'graphs.less' });

parser.parse(lessSource, function (err, tree) {
  if (err) throw err;
  var css = tree.toCSS({compress: true});

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { 
    bio: bio,
    projects: projects,
    technologies: technologies,
    technologyGroups: technologyGroups,
    employers: employers,
    degrees: degrees,
    interests: interests,
    profiles: profiles
  };

  var result = template(data);

  fs.writeFileSync(publicPath('index.html'), result);
});
