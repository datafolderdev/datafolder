let o = new Error("No such file");

module.exports = ({
    filePath: e,
    cChangeId: n
}) => {
    var t, l, i, e = qyDB.fileP(e);
    return e ? ({
        fileContent: e,
        cChangeId: t,
        fileContentKey: l
    } = e, i = {}, n != t && (Object.assign(i, {
        fileContent: e,
        cChangeId: t
    }), null == n) && (i.fileContentKey = l), i) : o;
};