module.exports = queryText => {
    let {
        folder,
        value,
        view,
        limit,
        cursor
    } = eval("((x)=>x)(" + queryText + ")"), fileList = qyDB.queryFiles(folder, value, limit, cursor), tree = {};
    for (var file of fileList) {
        let {
            parentList
        } = file, node = tree;
        for (var dir of parentList) {
            let {
                name,
                fullPathHash
            } = dir, subdirMap = node.subdirMap;
            subdirMap = subdirMap || (node.subdirMap = {}), node = subdirMap[name], 
            node = node || (subdirMap[name] = {
                fullPathHash: fullPathHash
            });
        }
        let fileMap = node.fileMap;
        fileMap = fileMap || (node.fileMap = {}), fileMap[file.name] = {
            fileContent: file.view(view, !0),
            fileContentKey: file.fileContentKey
        };
    }
    return {
        tree: tree,
        count: fileList.length
    };
};