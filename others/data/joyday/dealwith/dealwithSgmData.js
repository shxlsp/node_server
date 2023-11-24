const dataSource = require("./sgmData.json");
const fs = require("fs");
// console.log(js);
const res = [];
dataSource.forEach((data, idx) => {
  const saveD = {};
  data
    .sort((a, b) => a.data.startTime - b.data.startTime)
    .forEach((item, i) => {
      if (item.type === "net" && !saveD.netData) {
        const info = data[i - 1];
        saveD.resourceData = data[i - 1];
        saveD.netData = item;
        saveD.resourceDataLoadedTime =
          info.data.startTime + info.data.responseEnd - info.data.fetchStart;
        saveD.firstNetTime = item.data.startTime;
        // 存下这两个数据
        // console.log(
        //   info.data.startTime + info.data.responseEnd - info.data.fetchStart,
        //   data[i].data.startTime
        // );
      }
      if (item.type === "vitals" && item.data.name === "LCP") {
        saveD.LCP = item.data.value;
      }
      if (item.type === "vitals" && item.data.name === "TBT") {
        saveD.TBT = item.data.value;
      }
    });
  res.push(saveD);
});

console.log(res);

fs.writeFileSync("./afterDWJoydaySgmData.json", JSON.stringify(res), "utf-8");
