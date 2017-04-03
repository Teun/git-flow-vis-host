const commits = require('./commits');
const options = require('./config.js')([]);

commits.getBaseCommitData({path: options.repo, username: options.username, password: options.password}, {remotes:options.remotes})
    .then((result)=>{
        console.log(JSON.stringify(result));
    });
