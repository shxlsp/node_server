const alert1 = document.getElementById("alert1");
const alert2 = document.getElementById("alert2");
const canvas1 = document.getElementById("canvas1");
const ctx = canvas1.getContext("2d");
const color = "red";
let myKey = `okk${Math.random()}`;
const Store = ((storeKey) => {
  const setStore = (data) => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const getStore = () => {
    try {
      return JSON.parse(localStorage.getItem(storeKey));
    } catch (error) {}
  };
  let store = {};
  const updateStore = () => {
    store = getStore() || {};
    return store;
  };
  updateStore();
  return {
    store,
    setStore,
    updateStore,
  };
})("my_store");
function savePosition() {}
function draw() {
  const { clientWidth, clientHeight } = document.body; // 获取body高宽
  const { screenX, screenY } = window; // 获取浏览器相对屏幕坐标
  const barHeight = window.outerHeight - window.innerHeight; // 获取浏览器body顶部地址栏高度
  const barWidth = window.outerWidth - window.innerWidth; // 获取浏览器body顶部地址栏高度

  const store = Store.updateStore();
  store[myKey] = {
    clientWidth,
    clientHeight,
    screenX,
    screenY,
    barHeight,
    barWidth,
  };
  Store.setStore(store);
  // 记录log
  alert1.textContent = JSON.stringify(
    { clientWidth, clientHeight, screenX, screenY, barHeight, barWidth },
    "",
    2
  );
  // 设置canvas为整个body高宽，铺满body
  canvas1.width = clientWidth;
  canvas1.height = clientHeight;

  const [winXStart, winXEnd, winYStart, winYEnd] = [
    screenX,
    screenX + clientWidth,
    screenY,
    screenY + clientHeight,
  ];

  const drawArc = ({ x, y }) => {
    // 画圆
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  };
  const drayStroke = () => {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    let firstMovePosition = [];
    Object.values(store).forEach(
      (
        { clientWidth, clientHeight, screenX, screenY, barHeight, barWidth },
        i
      ) => {
        // 获取自己的圆心坐标，为body中心
        let x = clientWidth / 2;
        let y = clientHeight / 2;
        x = screenX + x - winXStart;
        y = screenY + y - winYStart;
        if (i === 0) {
          ctx.moveTo(x, y);
          firstMovePosition = [x, y];
          return;
        }
        ctx.lineTo(x, y);
      }
    );
    ctx.lineTo(...firstMovePosition);
    ctx.stroke();
  };

  drayStroke();

  Object.values(store).forEach(
    ({ clientWidth, clientHeight, screenX, screenY, barHeight, barWidth }) => {
      // 获取自己的圆心坐标，为body中心
      let x = clientWidth / 2;
      let y = clientHeight / 2;
      x = screenX + x - winXStart;
      y = screenY + y - winYStart;

      drawArc({ x, y });
    }
  );

  window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);

window.addEventListener("unload", () => {
  const store = Store.updateStore();
  delete store[myKey];
  Store.setStore(store);
  console.log(32);
});
