let Error_No_Such_File = new Error("No such file");

module.exports = ({
    filePath: e,
    cChangeId: n
}) => {
    var l, r, t, e = qyDB.fileP(e);
    return e ? ({
        fileContent: e,
        cChangeId: l,
        fileContentKey: r
    } = e, t = {}, n != l && (Object.assign(t, {
        fileContent: e,
        cChangeId: l
    }), null == n) && (t.fileContentKey = r), t) : Error_No_Such_File;
};