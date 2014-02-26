var fs = require('fs');
var less = require('less');
var handlebars = require('handlebars');

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

less.render(lessSource, {compress:true}, function (err, css) {
  if (err) throw err;

  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { 
    projects: projects,
    technologies: technologies
  };

  var result = template(data);

  fs.writeFileSync('./index.html', result);
});
