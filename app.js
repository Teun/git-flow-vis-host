const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const commits = require('./commits');
const options = require('./config.js')([
      { name: 'out', type: String},
]);

if(!options.out){
    throw "Use --out to specify the output directory";
}
if(!fs.existsSync(options.out)){
    throw "Directory '" + options.out + "' does not exist"
}
options.mainDataUrl = 'commits.json';

var template = fs.readFileSync("views/chart.html", "utf8");

commits.getBaseCommitData({path: options.repo, username: options.username, password: options.password}, {remotes:options.remotes})
    .then((result)=>{
        
        fs.writeFileSync(path.join(options.out, "commits.json"), JSON.stringify(result), {encoding:'utf8'});
        var rendered = mustache.render(template, options);
        fs.writeFileSync(path.join(options.out, "index.html"), rendered, {encoding:'utf8'});
        var staticDir = path.join(options.out, 'gfv');
        if (!fs.existsSync(staticDir)){
            fs.mkdirSync(staticDir);
        }
        fs.createReadStream('node_modules/git-flow-vis/dist/gitflow-visualize.bundle.js').pipe(fs.createWriteStream(staticDir + '/gitflow-visualize.bundle.js'));
        fs.createReadStream('node_modules/git-flow-vis/dist/gitflow-visualize.css').pipe(fs.createWriteStream(staticDir + '/gitflow-visualize.css'));
    });
