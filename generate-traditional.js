var fs = require('fs');
var less = require('less');
var handlebars = require('handlebars');
var _ = require('underscore');

var bio = require('./bio');
var projects = require('./projects');
var technologies = require('./technologies');
var employers = require('./employers');
var degrees = require('./degrees');
var profiles = require('./profiles');
var interests = require('./interests');

var lessSource = fs.readFileSync('./traditional.less').toString();
var htmlSource = fs.readFileSync('./index.html.tmpl').toString();

handlebars.registerPartial('nav', fs.readFileSync('./nav.html.tmpl').toString());

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

less.render(lessSource, {compress:true}, function (err, css) {
  if (err) throw err;

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { 
    bio: bio,
    projects: projects,
    technologies: technologies,
    technologyGroups: technologyGroups,
    employers: employers,
    degrees: degrees
  };

  var result = template(data);

  fs.writeFileSync('./index.html', result);
});
