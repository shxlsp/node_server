const { v1 } = require("uuid");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { symbolMatching } = require("../template/1括号匹配");
const getLiData = (str) => {
  // ?: 表示不生成组
  // ?!xxx表示否定前缀匹配，即不匹配"xxx"字符串
  var reg =
    / ((?:(?:(?!(?:class|\s|width|onclick|height|source-data-lazy-advertisement|target))).)*?)="(.*?)"/g;
  const data = {};
  while (true) {
    const r = reg.exec(str);
    // console.log(r);
    if (!r) {
      break;
    }
    const key = r[1].trim();
    if (key === "class") {
      continue;
    }
    const value = r[2].trim();
    data[key] = value;
  }
  // const dealwithOtherData = () => {
  const regPrice = new RegExp(
    `<em>(.+?)</em><i data-price="${data["data-price"]}">(.*?)</i>`
  );
  const regMiniTitle =
    /<em>(.*?)<font class="skcolor_ljg">(.*?)<\/font>(.*?)<\/em>/;
  const regSelf =
    /<i .*?class=.*?goods-icon.*?data-tips="京东自营，品质保障".*?自营<\/i>/;
  const regNew =
    /<i .*?class=.*?goods-icon.*?data-tips="该商品是当季新品.*?新品<\/i>/;
  const price = regPrice.exec(str);
  const miniTitle = regMiniTitle.exec(str);
  data.priceSymbol = price[1];
  data["data-price"] = price[2];
  data.miniTitleSource = miniTitle.slice(1).map((i) => i.trim());
  data.miniTitle = miniTitle
    .slice(1)
    .map((i) => i.trim())
    .join(" ");
  data.isSelf = regSelf.test(str);
  data.isNew = regNew.test(str);
  // };
  // dealwithOtherData();
  return data;
};
const init = async () => {
  const qs = (await import("query-string")).default;
  const { cloneDeep } = await import("lodash-es");

  const jdApis = {
    search: {
      api: "https://search.jd.com/Search",
      method: "get",
      params: {
        keyword: "string",
        enc: "utf-8",
        wq: "string",
        pvid: "string",
      },
    },
  };

  const searchJDItem = (searchValue) => {
    const params = cloneDeep(jdApis.search.params);
    params.keyword = searchValue;
    params.wq = searchValue;
    params.pvid = v1();
    console.log(params);
    console.log(qs.stringify(params, { arrayFormat: "index" }));
    return axios
      .get(
        `${jdApis.search.api}?${qs.stringify(params, { arrayFormat: "index" })}`
      )
      .then((res) => {
        // console.log(res);
        fs.writeFileSync(
          path.join(__dirname, searchValue + "JDSearch.html"),
          res.data,
          "utf-8"
        );
        return res.data;
      });
  };

  searchJDItem("iphone15").then((res) => {
    const ul = symbolMatching(res, [
      ['<ul class="gl-warp clearfix"', "</ul>", "ul"],
    ]);
    const ulString = ul.getStrArrFull().ul[0];
    // fs.writeFileSync(path.join(__dirname, "aa.html"), ulString, "utf-8");
    console.log("ulString", ulString, ul);
    const lis = symbolMatching(ulString, [["<li", "</li>", "lis"]]);
    const lisArr = lis.getStrArrFull().lis;
    const lisString = lisArr.join("\n\n\n\n\n\n");
    fs.writeFileSync(path.join(__dirname, "aa.html"), lisString, "utf-8");

    const lisDataList = lisArr.map((str) => getLiData(str));
    fs.writeFileSync(
      path.join(__dirname, "lisDataList.json"),
      JSON.stringify(lisDataList),
      "utf-8"
    );

    // fs.writeFileSync(
    //   path.join(__dirname, "ab.html"),
    //   lis.getStrArr().join("\n\n\n\n\n"),
    //   "utf-8"
    // );
    // const commodityList = lis.getStrArr();
    // commodityList.forEach(commodityStr => {
    //   symbolMatching(commodityStr, [''])
    // })
  });
};
init();

// 正则方法（弃用！用不了一点）
// 最后还是得混用，md真香
// let res = fs.readFileSync(
//   path.join(__dirname, "./iphone15JDSearch.html"),
//   "utf-8"
// );

// const reg = /<ul class="gl-warp clearfix".*<\/li><\/ul>/g;
// \n 匹配换行符
// \r 匹配回车符
// \t 匹配制表符
// res = res.replace(/>\s*</g, "><").replace(/(\n|\r|\t)/g, "");
// fs.writeFileSync(path.join(__dirname, "aa.html"), reg.exec(res)[0], "utf-8");
// console.log(reg.exec(res));
// console.log(res);

// 括号匹配方法
// console.log(symbolMatching(res, ['<ul class="gl-warp clearfix"', "</ul>"]));
