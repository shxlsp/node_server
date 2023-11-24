// ajax
var send = async (path, data) => {
  await new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open("post", "http://localhost:9090/joyday/performance/" + path, false);

    // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // let sendStr = "";
    // Object.keys(data).forEach((key) => {
    //   sendStr += `${key}=${JSON.stringify(data[key])}&`;
    // });
    xhr.onreadystatechange = () => {
      xhr.readyState === 4 && resolve();
    };
    data.type = localStorage.getItem("web-vitals-shx-input-type");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
    xhr.send(sendStr);
  });
};

// load script
var script = document.createElement("script");
script.innerHTML = localStorage.getItem("web-vitals-shx-js");
document.body.appendChild(script);

// use web vitals
const saveData = {};
const saveDataFN = (data) => {
  saveData[data.name] = data;
  console.log(saveData);
};

const opt = { reportAllChanges: true };
const params = [saveDataFN, opt];
// webVitals.onCLS(...params);
// webVitals.onFID(...params);
webVitals.onLCP(...params);
// webVitals.onTTFB(...params);
// webVitals.onFCP(...params);

// send ajax
const sendAjax = () => {
  setTimeout(async () => {
    await send("core", saveData);
    location.reload();
  }, 5000);
};
if (Number(localStorage.getItem("web-vitals-shx-is-start"))) {
  // console.log("trueeeee");
  sendAjax();
}
