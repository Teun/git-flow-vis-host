const git = require("nodegit");
const commandLineArgs = require('command-line-args')
 
const optionDefinitions = [
  { name: 'repo', alias: 'r', type: String, defaultOption: true },
  { name: 'output', alias: 't', type: String },
  { name: 'historyPerBranch', alias:'h', type: Number, defaultValue: 25},
  { name: 'remotes', type:Boolean, defaultValue: false}
];
const options = commandLineArgs(optionDefinitions);

var result = {branches:{values:[]}, tags:{values:[]}, commits:[]};
git.Repository.open(options.repo).then(
        (repo) => {
            return repo.getReferences(git.Reference.TYPE.OID)
                .then((refs)=>{
                    var promises = [];
                    promises.push(new Promise((res)=>{
                        var branches = options.remotes ?
                             refs.filter(ref=>ref.isRemote()) :
                             refs.filter(ref=>ref.isBranch());
                        var all = branches.map(getDataFromBranch);
                        Promise.all(all)
                            .then((branches)=> {
                                result.branches.values = branches;
                                res(branches);
                            });
                    }));
                    promises.push(new Promise((res)=>{
                        var tags = refs.filter(ref=>ref.isTag());
                        var all = tags.map(getDataFromTag);
                        Promise.all(all)
                            .then((tags)=> {
                                result.tags.values = tags.filter((t)=> (t !== null));
                                res(tags);
                            });
                        
                    }));

                    return Promise.all(promises);
                })
                .then(()=>{
                    console.log(JSON.stringify(result));
                });
        });
function getDataFromBranch(ref){
    var promise = new Promise((resolve, reject)=>{
        var branch = {};
        branch.id = ref.name();
        branch.displayId = ref.shorthand();
        branch.latestChangeset = ref.target().tostrS();
        var repo = ref.owner();
        var walker = repo.createRevWalk();
        walker.sorting(git.Revwalk.SORT.TIME);
        walker.push(ref.target());
        walker.getCommits(50)
            .then(commits =>{
                result.commits.push({values:
                    commits.map(c => {
                        return {
                            id: c.sha(),
                            displayId: c.sha().substr(0,7),
                            message: c.message(),
                            authorTimestamp: c.timeMs(),
                            parents: c.parents().map(p => {
                                return {id: p.tostrS()};
                            })
                        };
                    })
                });
                resolve(branch);
            });
    });
    return promise;
}

function getDataFromTag(ref){
    var promise = new Promise((resolve, reject)=>{
        var tag = {};
        tag.id = ref.name();
        tag.displayId = ref.shorthand();
        ref.owner().getTag(ref.target())
            .then((t)=>{
                tag.latestChangeset = t.targetId().tostrS();
                resolve(tag);
            })
            .catch((err)=>{
                resolve(null);
            });
        
    });
    return promise;
}