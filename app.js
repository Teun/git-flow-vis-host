const commandLineArgs = require('command-line-args')
const commits = require('./commits');
 
const optionDefinitions = [
  { name: 'repo', alias: 'r', type: String, defaultOption: true },
  { name: 'output', alias: 't', type: String },
  { name: 'historyPerBranch', alias:'h', type: Number, defaultValue: 25},
  { name: 'remotes', type:Boolean, defaultValue: false}
];
const options = commandLineArgs(optionDefinitions);

commits.getBaseCommitData(options.repo, {remotes:options.remotes})
    .then((result)=>{
        console.log(JSON.stringify(result));
    });
