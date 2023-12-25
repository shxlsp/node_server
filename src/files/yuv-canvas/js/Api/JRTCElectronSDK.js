const JRTCEngine = require("./index.js");

var engine = new JRTCEngine();
engine.initEngine();
console.log(typeof engine);
console.log(typeof engine.JRTCEngine);
console.log(typeof engine.initEngine);
