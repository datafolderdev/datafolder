let a = new Error("No such file");

module.exports = ({
    filePath: e,
    cChangeId: n
}) => {
    var t, l, o, e = dataFolder.fileP(e);
    return e ? ({
        fileContent: e,
        cChangeId: t,
        fileContentKey: l
    } = e, o = {}, n != t && (Object.assign(o, {
        fileContent: e,
        cChangeId: t
    }), null == n) && (o.fileContentKey = l), o) : a;
};