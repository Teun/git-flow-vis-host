const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  { name: 'repo', alias: 'r', type: String, defaultOption: true },
  { name: 'remotes', type:Boolean, defaultValue: false},

  { name: 'masterRef', type: String},
  { name: 'developRef', type: String},
  { name: 'featurePrefix', type: String},
  { name: 'releasePrefix', type: String},
  { name: 'hotfixPrefix', type: String},
  { name: 'releaseZonePattern', type: String},
  { name: 'releaseTagPattern', type: String},
  { name: 'commitUrlTemplate', type: String},
];
module.exports = function(extra){
    var def = optionDefinitions.concat(extra);
    return commandLineArgs(def);
}

