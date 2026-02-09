module.exports = queryText => {
    let {
        folder,
        value,
        view,
        limit,
        cursor
    } = eval("((x)=>x)(" + queryText + ")");
    return qyDB.fileListToTree(qyDB.queryFiles(folder, value, limit, cursor), view);
};