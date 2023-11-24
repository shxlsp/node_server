const operationRender = () => {
  alert(`${window.require}, ${window.electron}, ${window.System}`);
  //样式
  const link = document.createElement("link");
  link.href = "http://localhost:9090/e/css";
  link.rel = "stylesheet";
  document.head.appendChild(link);

  const template = `
    <div class="electron-dev-operation large">
      <div class="open-dev-tools btn">打开控制台</div>
      <div class="refresh btn">刷新页面</div>
      <div class="hide btn">收起</div>
    </div>
  `;
  const div = document.createElement("div");
  div.innerHTML = template;
  div.onclick = (e) => {
    const el = e.target;
    const className = el.className;
    switch (true) {
      case className.includes("open-dev-tools"):
        openDevTools();
        break;
      case className.includes("refresh"):
        refresh();
        break;
      case className.includes("hide"):
      case className.includes("show"):
        hideOrShow();
        break;
    }
  };

  //打开devTools
  function openDevTools() {
    try {
      alert(
        "window.require：" +
          JSON.stringify(Object.keys(window).filter((k) => k.includes("r")))
      );
      const { ipcRenderer, remote } = require("electron");
      window.ipcRenderer = ipcRenderer;
      window.remote = remote;
      // ipcRenderer.send("OPEN_DEBUG");
      const web = remote.getCurrentWebContents();
      if (web) {
        web.openDevTools();
      }
    } catch (error) {
      alert("启动失败111", JSON.stringify(error));
    }
  }

  // 刷新
  function refresh() {
    location.reload();
  }

  //展开折叠
  const hideOrShow = (() => {
    let isShow = true;
    return () => {
      if (isShow) {
        const templateHide = `<div class="electron-dev-operation"><div class="show btn s">展开</div><div>`;
        render(templateHide);
      } else {
        render(template);
      }
      isShow = !isShow;
    };
  })();

  function render(template) {
    if (template !== void 0) {
      div.innerHTML = template;
    }
    document.body.appendChild(div);
  }

  render(template);
};

operationRender();
