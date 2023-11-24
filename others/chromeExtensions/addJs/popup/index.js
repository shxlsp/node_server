document.querySelector(".box").addEventListener("click", (e) => {
  console.log(e.target.dataset.key);
  switch (e.target.dataset.key) {
    case "start":
      console.log("start");
      chrome.storage.local.set({ isStart: true });
      // chrome.storage.local.get(["isStart"]).then((result) => {
      //   console.log("Value currently is " + result.isStart);
      // });
      break;
    case "end":
      chrome.storage.local.set({ isStart: false });
      break;

    case "input-type":
      chrome.storage.local.set({
        inputType: document.querySelector(".input-type").value,
      });
      break;

    case "input-type-clearn":
      chrome.storage.local.set({ inputType: "" });
      document.querySelector(".input-type").value = "";
      break;
    default:
      break;
  }
});
chrome.storage.local.get(["inputType"]).then((r) => {
  document.querySelector(".input-type").value = r.inputType;
});
