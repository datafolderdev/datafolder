module.exports = queryText => {
    let {
        folder,
        value,
        view,
        limit,
        cursor
    } = eval("((x)=>x)(" + queryText + ")");
    return dataFolder.queryTree(folder, value, view, limit, cursor);
};