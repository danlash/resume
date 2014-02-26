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


var lessSource = fs.readFileSync('./app.less').toString();
var htmlSource = fs.readFileSync('./index.html.tmpl').toString();

handlebars.registerHelper('bar', function(data){
  return '#####'.slice(-1 * data);
});


handlebars.registerPartial('nav', '\
  <nav>\
    <a href="index.html">Traditional</a>\
    <a href="graphs.html">Graphs</a>\
    <a href="timeline.html">Timeline</a>\
    <a href="map.html">Map</a>\
    <a href="data.html">Data</a>\
  </nav>\
  ');

var technologyGroups = _.groupBy(technologies, function(technology){
  return technology.type;
});

technologyGroups = _.map(technologyGroups, function(technologies, name){
  return { type: name, technologies: technologies };
});

_.each(projects, function(project){
  var employer = _.find(employers, function(e) { return e.name === project.employer; });
  employer.highlights = employer.highlights || [];
  employer.highlights = employer.highlights.concat(project.highlights);
});  

less.render(lessSource, {compress:true}, function (err, css) {
  if (err) throw err;

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { 
    bio: bio,
    projects: projects,
    technologies: technologies,
    technologyGroups: technologyGroups,
    employers: employers
  };

  var result = template(data);

  fs.writeFileSync('./index.html', result);
});
