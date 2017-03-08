var express = require('express')
var mustacheExpress = require('mustache-express');
const commandLineArgs = require('command-line-args')
const commits = require('./commits');
 
const optionDefinitions = [
  { name: 'repo', alias: 'r', type: String, defaultOption: true },
  { name: 'remotes', type:Boolean, defaultValue: false},
  { name: 'username', alias: 'u', type: String},
  { name: 'password', alias: 'p', type: String},

  { name: 'masterRef', type: String},
  { name: 'developRef', type: String},
  { name: 'featurePrefix', type: String},
  { name: 'releasePrefix', type: String},
  { name: 'hotfixPrefix', type: String},
  { name: 'releaseZonePattern', type: String},
  { name: 'releaseTagPattern', type: String},
  { name: 'commitUrlTemplate', type: String},
];
const options = commandLineArgs(optionDefinitions);


var app = express()
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/gfv', express.static('node_modules/git-flow-vis/dist'));

app.get('/', function(req, res){
    var data = options;
    data.moreDataCallback = true;
    data.mainDataUrl = "/commits/";
    res.render('chart.html', data);
});
app.get('/commits/', function(req, res){
    commits.getBaseCommitData({path: options.repo, username: options.username, password: options.password}, {remotes:options.remotes})
        .then((result)=>{
            res.type('json');
            res.write(JSON.stringify(result));
            res.end();
        });

})
app.get('/commits/from/:commit', function (req, res) {
    var params = req.params;
    var root = params.commit;
    commits.getAncestorsFor({path: options.repo, username: options.username, password: options.password}, root)
        .then((result)=>{
            res.type('json');
            res.write(JSON.stringify({values:result}));
            res.end();
        });
})

app.listen(3000, function () {
  console.log('Listening on port 3000');
  if(!options.username && options.remotes){
      console.log("No username provided, so we will not be able to automtically fetch new data from remotes.");
  }
})
