const Koa = require("koa");
const router = require("./src/router");
const bodyParser = require("koa-bodyparser");
const app = new Koa();

app.use(
  bodyParser({
    enableTypes: ["json", "form"],
  })
);
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(9001);
console.log("run in 9001");
