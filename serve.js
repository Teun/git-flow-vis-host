/*
This file is part of git-flow-json-commits.

git-flow-json-commits is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

GitFlowVisualize is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with git-flow-json-commits. If not, see <http://www.gnu.org/licenses/>.
*/


var express = require('express')
var mustacheExpress = require('mustache-express');
const commits = require('./commits');
 
const options = require('./config.js')([
  { name: 'username', alias: 'u', type: String},
  { name: 'password', alias: 'p', type: String},
]);


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
app.get('/branches/', function(req, res){
    commits.getBranchTips({path: options.repo, username: options.username, password: options.password}, {remotes:options.remotes})
        .then((branches)=>{
            var result = {values:branches};
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
