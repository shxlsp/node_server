var send = (path, data) => {
  var xhr = new XMLHttpRequest();
  xhr.open("post", "http://localhost:9090/joyday/performance/" + path, false);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  let sendStr = "";
  Object.keys(data).forEach((key) => {
    sendStr += `${key}=${JSON.stringify(data[key])}&`;
  });
  xhr.send(sendStr);
};
(() => {
  const navigationType = {
    0: "正常进入非刷新，非重定向",
    1: "通过刷新的方式进入",
    2: "通过前进回退按钮进入",
    255: "非正常进入，非刷新，非前进回退进入",
  };
  let Performance = window.performance;
  let timing = Performance.timing;
  let navigation = Performance.navigation;
  let memory = Performance.memory;
  let PerformanceObj = {
    timing: {},
    navigation: {},
  }; // 性能监控对象
  if (timing) {
    PerformanceObj["timing"]["上一页面的卸载耗时"] =
      timing.unloadEventEnd - timing.navigationStart;
    PerformanceObj["timing"]["重定向耗时"] =
      timing.redirectEnd - timing.redirectStart;
    PerformanceObj["timing"]["查询appDNS缓存耗时"] =
      timing.domainLookupStart - timing.fetchStart;
    PerformanceObj["timing"]["DNS查询耗时"] =
      timing.domainLookupEnd - timing.domainLookupStart;
    PerformanceObj["timing"]["TCP连接建立耗时"] =
      timing.connectEnd - timing.connectStart;
    PerformanceObj["timing"]["服务器响应耗时"] =
      timing.responseStart - timing.requestStart; // 发起请求到响应第一个字节
    PerformanceObj["timing"]["request请求耗时"] =
      timing.responseEnd - timing.responseStart; // 响应第一个字节到响应最后一个字节
    PerformanceObj["timing"]["总耗时"] =
      (timing.loadEventEnd ||
        timing.loadEventStart ||
        timing.domComplete ||
        timing.domLoading) - timing.navigationStart;
    PerformanceObj["timing"]["解析dom树耗时"] =
      timing.domComplete - timing.responseEnd;
  }
  if (navigation) {
    PerformanceObj["navigation"]["重定向次数"] = navigation.navigation || 0;
    PerformanceObj["navigation"]["进入页面方式"] =
      navigationType[navigation.type] || "进入页面方式加载异常";
  }
  setTimeout(() => {
    // 上传基本指标
    send("base", PerformanceObj);
  }, 1000);
  // if (memory) {
  //   setInterval(() => {
  //     // 上传内存使用情况
  //     send("memory", memory.jsHeapSizeLimit, memory.totalJSHeapSize);
  //   }, 300);
  // }
})();
window.onload = () => {
  // 核心数据上报
  let coreObj = {};
  let Performance = window.performance.timing;
  // TTFB
  coreObj["TTFB"] = Performance.responseStart - Performance.navigationStart;
  // FP
  coreObj["FP"] = performance
    .getEntries("paint")
    .filter((entry) => entry.name == "first-paint")[0].startTime;
  // FCP
  coreObj["FCP"] = performance
    .getEntries("paint")
    .filter((entry) => entry.name == "first-contentful-paint")[0].startTime;
  // LCP
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.startTime) {
        coreObj["LCP"] = entry.startTime;
      }
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  // TTI
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!coreObj["TTI"]) {
        coreObj["TTI"] = entry.startTime;
      }
    }
  }).observe({ entryTypes: ["longtask"] });
  setTimeout(() => {
    send("core", coreObj);
  }, 3000);
};
