// local
chrome.storage.local.set({ key: value }).then(() => {
  console.log("Value is set");
});

chrome.storage.local.get(["key"]).then((result) => {
  console.log("Value currently is " + result.key);
});

// //sync
// chrome.storage.sync.set({ key: value }).then(() => {
//   console.log("Value is set");
// });

// chrome.storage.sync.get(["key"]).then((result) => {
//   console.log("Value currently is " + result.key);
// });

// //session
// chrome.storage.session.set({ key: value }).then(() => {
//   console.log("Value was set");
// });

// chrome.storage.session.get(["key"]).then((result) => {
//   console.log("Value currently is " + result.key);
// });
