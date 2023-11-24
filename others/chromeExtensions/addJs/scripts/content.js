const loadWebVitals = () => {
  var script = document.createElement("script");
  const url = chrome.runtime.getURL("scripts/webVitals.js");
  // console.log(url);
  script.src = url;
  document.body.appendChild(script);
};

chrome.storage.local.get(["isStart", "inputType"]).then((result) => {
  localStorage.setItem("web-vitals-shx-is-start", Number(result.isStart));
  localStorage.setItem("web-vitals-shx-input-type", result.inputType);
});

const xhr = new XMLHttpRequest();
xhr.open(
  "get",
  "https://unpkg.com/web-vitals@3.5.0/dist/web-vitals.attribution.iife.js"
);
xhr.onreadystatechange = () => {
  if (xhr.readyState === 4) {
    // console.log(xhr.response);
    localStorage.setItem("web-vitals-shx-js", xhr.response);
    // script.innerHTML = localStorage.getItem("a_a_a");
    loadWebVitals();
  }
};
xhr.send();
// script.src =
//   "https://unpkg.com/web-vitals@3.5.0/dist/web-vitals.attribution.iife.js";
// script.onload = function () {
//   // When loading `web-vitals` using a classic script, all the public
//   // methods can be found on the `webVitals` global namespace.
//   webVitals.onCLS(console.log);
//   webVitals.onFID(console.log);
//   webVitals.onLCP(console.log);
// };
