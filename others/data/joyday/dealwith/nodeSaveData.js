const fs = require("fs");
const readline = require("readline");
const reqFileData = "./sgmData.json";
let fileData = [];
try {
  fileData = JSON.parse(fs.readFileSync(reqFileData, "utf-8"));
} catch (error) {}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let rlSave = "";
rl.on("line", (data) => {
  if (data === "quit") return rl.close();
  rlSave += data.trim();

  rl.prompt();
});

rl.on("close", () => {
  fs.writeFileSync(reqFileData, JSON.stringify(fileData), "utf-8");
});
rl.setPrompt("输入需要储存的数据 ");
rl.prompt();
process.stdin.on("keypress", (str, key, ...args) => {
  // console.log(str, key, ...args);
  if (key.ctrl && key.name === "s") {
    console.log("c+s");
    let data;
    try {
      data = JSON.parse(rlSave);
    } catch (error) {
      rlSave = "";
      console.log("error json parse data");
      return;
    }
    rlSave = "";
    fileData.push(data);
  }
  if (key.sequence === "\r") {
    console.log("回车");
  }
  if (key.sequence === "\t") {
    console.log("tab");
  }
});
