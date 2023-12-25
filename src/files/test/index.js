(() => {
  // 创建一个代理对象，用于拦截函数调用
  // var a = window.console.log;
  // const proxy = new Proxy(a, {
  //   apply: (target, fn, args) => {
  //     const error = new Error("");
  //     // error.stack = "";
  //     const stackTrace = error.stack
  //       .split("\n")
  //       .filter((a) => a !== "Error")
  //       .slice(1)
  //       .map((i) => i.split(" ").at(-1).replace(/\(|\)/g, ""));
  //     // console.log(stackTrace);
  //     a("代理拦截：调用被拦截", target, this, fn, args);
  //     return a.call(fn, ...args, "stackTrace:", ...stackTrace);
  //   },
  // });
  // window.console.log = proxy;
  // proxy();
  // const a = () => {
  //   console.log(123);
  // };
  // const proxy1 = new Proxy(a, {
  //   apply: (target, args) => {
  //     console.log("代理拦截：调用被拦截");
  //     return target.apply(this, args);
  //   },
  // });
  // proxy1();
  // a();
  // window.a = window.console.log;
  // window.console.log = (...args) => {
  //   a.apply(window.console, args);
  // };
  // window.abc = (...args) => {
  //   a(...args);
  // };
})();
