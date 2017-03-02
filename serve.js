var express = require('express')
const commandLineArgs = require('command-line-args')
const commits = require('./commits');
 
const optionDefinitions = [
  { name: 'repo', alias: 'r', type: String, defaultOption: true },
  { name: 'remotes', type:Boolean, defaultValue: false},
  { name: 'username', alias: 'u', type: String},
  { name: 'password', alias: 'p', type: String}
];
const options = commandLineArgs(optionDefinitions);


var app = express()

app.use('/gfv', express.static('node_modules/git-flow-vis/dist'));

app.get('/', function(req, res){
    res.sendFile('chart.html', {root: __dirname});
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
  console.log('Listening on port 3000!')
})
