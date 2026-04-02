let s = new Error("No such dir");

module.exports = ({
    dirPath: a,
    dChangeId: d,
    fChangeId: e
}) => {
    var r, a = dataFolder.dirP(a);
    return a ? (r = {}, d || e || (r.fullPathHash = a.fullPathHash), d != a.dChangeId && Object.assign(r, {
        subdirList: a.sortedSubdirList.map(a => a.name),
        dChangeId: a.dChangeId
    }), e != a.fChangeId && Object.assign(r, {
        fileList: a.sortedFileList.map(a => a.name),
        fChangeId: a.fChangeId
    }), r) : s;
};