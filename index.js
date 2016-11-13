var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/scripts'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/maps', function(request, response) {
  response.render('pages/maps');
});

app.listen(app.get('port'), function() {
  console.log('Portolio is running on port', app.get('port'));
});


