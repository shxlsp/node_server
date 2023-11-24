const router = require("koa-router")();
const fs = require("fs");
const path = require("path");
// const response = require("koa2-response");
router.get("/e", (ctx, next) => {
  // response.success(ctx, {
  //   name: "test",
  // });
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.body = fs.readFileSync(path.join(__dirname, "./electron/electron_cb.js"));
});
router.get("/e/css", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "text/css");
  ctx.body = fs.readFileSync(
    path.join(__dirname, "./electron/electron_cb.css")
  );
});

router.get("/test", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "text/html");
  ctx.body = fs.readFileSync(
    path.join(__dirname, "./electron/embeddedDrawer.html")
  );
});
router.get("/test/window", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "text/html");
  ctx.body = fs.readFileSync(
    path.join(__dirname, "./electron/embeddedWindow.html")
  );
});

router.get("/joyday/performance", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "application/javascript");
  ctx.body = fs.readFileSync(path.join(__dirname, "./performance/index.js"));
});

router.post("/joyday/performance/base", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  console.log(ctx.request.body, ctx.request.origin);
  let res;
  const filePath = path.join(__dirname, "performance/base.json");
  try {
    res = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    res = [];
  }
  res.push(ctx.request.body);
  fs.writeFile(filePath, JSON.stringify(res), "utf-8", () => {});
  ctx.body = "ok";
});

// 解决浏览器预检测跨域报错问题
router.options("/joyday/performance/core", (ctx) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Headers", "content-type");
  ctx.body = "ok";
});
router.post("/joyday/performance/core", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  console.log(ctx.request.body, ctx.request.origin);
  const type = ctx.request.body.type || "core";
  delete ctx.request.body.type;
  let res;
  const filePath = path.join(__dirname, `performance/${type}.json`);
  try {
    res = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    res = [];
  }
  res.push({ ...ctx.request.body, len: res.length });
  fs.writeFile(filePath, JSON.stringify(res), "utf-8", () => {});
  ctx.body = "ok";
});

router.get("/joyday/error", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "application/javascript");
  ctx.body = fs.readFileSync(path.join(__dirname, "./performance/index.js"));
});

router.get("/cache/html", (ctx, next) => {
  console.log("innnnnn");
  ctx.set("Cache-Control", "max-age=99999999");
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "text/html; charset=utf-8");
  ctx.body = `<html><head><title>hello</title></head><body><h1>hello</h1></body></html>`;
});

router.get("/worker/(.*)", (ctx, next) => {
  const fileName = ctx.path.split("worker/")[1];
  console.log("innnnnn", fileName);
  const fileType = fileName.split(".")[1];
  let contentType = "";
  switch (fileType) {
    case "js":
      contentType = "application/javascript";
      break;
    case "css":
      contentType = "text/css";
      break;
    case "html":
      contentType = "text/html";
      break;
    default:
      contentType = "text/html";
      break;
  }
  // ctx.set("Cache-Control", "max-age=99999999");
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", contentType + "; charset=utf-8");
  ctx.body = fs.readFileSync(
    path.join(__dirname, "../1.web_worker/" + fileName)
  );
});

router.get("/frameLoad.html", (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Content-Type", "text/html");
  ctx.body = fs.readFileSync(path.join(__dirname, "./electron/frameLoad.html"));
});
module.exports = router;
// http://localhost:5001/bundle.js
