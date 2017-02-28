const git = require("nodegit");

function getBaseCommitData(repo, options){
    var result = {branches:{values:[]}, tags:{values:[]}, commits:[]};
    return git.Repository.open(repo).then(
        (repo) => {
            return repo.getReferences(git.Reference.TYPE.OID)
                .then((refs)=>{
                    var promises = [];
                    promises.push(new Promise((res)=>{
                        var branches = options.remotes ?
                             refs.filter(ref=>ref.isRemote()) :
                             refs.filter(ref=>ref.isBranch());
                        var all = branches.map((b)=> getDataFromBranch(b, result));
                        Promise.all(all)
                            .then((branches)=> {
                                result.branches.values = branches;
                                res(branches);
                            });
                    }));
                    promises.push(new Promise((res)=>{
                        var tags = refs.filter(ref=>ref.isTag());
                        var all = tags.map((t)=> getDataFromTag(t, result));
                        Promise.all(all)
                            .then((tags)=> {
                                result.tags.values = tags.filter((t)=> (t !== null));
                                res(tags);
                            });
                        
                    }));

                    return Promise.all(promises);
                })
                .then(()=> result);
        });
}
function getCommitsFromChild(repo, id, nr){
    var walker = repo.createRevWalk();
    walker.sorting(git.Revwalk.SORT.TIME);
    walker.push(id);
    return walker.getCommits(nr)
        .then(commits =>{
            return commits.map(c => {
                return {
                    id: c.sha(),
                    displayId: c.sha().substr(0,7),
                    message: c.message(),
                    authorTimestamp: c.timeMs(),
                    author:{
                        name: c.author().name(),
                        emailAddress: c.author().email()
                    },
                    parents: c.parents().map(p => {
                        return {id: p.tostrS()};
                    })
                };
            });
        });

}
function getDataFromBranch(ref, result){
    var promise = new Promise((resolve, reject)=>{
        var branch = {};
        branch.id = ref.name();
        branch.displayId = ref.shorthand();
        branch.latestChangeset = ref.target().tostrS();
        getCommitsFromChild(ref.owner(), ref.target(), 20)
            .then((commits)=>{
                result.commits.push({values: commits});
                resolve(branch);
            });
    });
    return promise;
}

function getDataFromTag(ref, result){
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
function getAncestorsFor(repo, root){
    return git.Repository.open(repo).then(
        (repo) => {
            return getCommitsFromChild(repo, root, 20);
        });
}

module.exports = {
    getBaseCommitData:getBaseCommitData,
    getAncestorsFor: getAncestorsFor
}