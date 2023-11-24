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
// if (memory) {
//   setInterval(() => {
//     console.log(memory.jsHeapSizeLimit, memory.totalJSHeapSize);
//   }, 300);
// }

// 推广监听navigation的方式，计算navigation到responseStart的差值
new PerformanceObserver((entryList) => {
  const [pageNav] = entryList.getEntriesByType("navigation");
  Performance.TTFB = pageNav.responseStart;
  console.log(pageNav.responseStart);
  // TTFB = pageNav.responseStart
}).observe({
  type: "navigation",
  buffered: true,
});

new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntriesByName("first-contentful-paint")) {
    // entry.startTime的值即为FCP
    console.log("FCP listen", entry.startTime);
  }
}).observe({ type: "paint", buffered: true });

new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    // entry.startTime 的值即为LCP
    Performance.LCP = entry.startTime;
  }
}).observe({ type: "largest-contentful-paint", buffered: true });

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // entry.startTime 的值即为TTI
    Performance.TTI = entry.startTime;
  }
}).observe({ entryTypes: ["longtask"] });

window.onload = () => {
  console.log(
    performance
      .getEntries("paint")
      .filter((entry) => entry.name == "first-paint")[0].startTime,
    "FP onload"
  );
  console.log(
    performance
      .getEntries("paint")
      .filter((entry) => entry.name == "first-contentful-paint")[0].startTime,
    "FCP onload"
  );
};
