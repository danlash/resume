var fs = require('fs');
var less = require('less');
var handlebars = require('handlebars');

var lessSource = fs.readFileSync('./app.less').toString();

less.render(lessSource, {compress:true}, function (err, css) {
  if (err) throw err;


  var htmlSource = fs.readFileSync('./index.html.tmpl').toString();
  handlebars.registerPartial('css', css);
  var template = handlebars.compile(htmlSource);


  var data = { };
  var result = template(data);

  fs.writeFileSync('./index.html', result);
});
