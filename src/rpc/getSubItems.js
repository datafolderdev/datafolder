let Error_no_Such_Dir = new Error("No such dir");

module.exports = ({
    dirPath: r,
    dChangeId: e,
    fChangeId: a
}) => {
    r = qyDB.dirP(r);
    if (!r) return Error_no_Such_Dir;
    var d = {};
    if (e || a || (d.fullPathHash = r.fullPathHash), e != r.dChangeId) {
        var h, e = r.sortedSubdirList, i = [];
        for ({
            name: h
        } of e) i.push(h);
        Object.assign(d, {
            subdirList: i,
            dChangeId: r.dChangeId
        });
    }
    if (a != r.fChangeId) {
        var n, e = r.sortedFileList, s = [];
        for ({
            name: n
        } of e) s.push(n);
        Object.assign(d, {
            fileList: s,
            fChangeId: r.fChangeId
        });
    }
    return d;
};