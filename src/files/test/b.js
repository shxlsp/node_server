// console.log("123123123123", "sdfsdfsdf", "sdfsdfs");
// abc("123123123123", "sdfsdfsdf", "abc");
// a("123123123123", "sdfsdfsdf", "a");
// console.log("@source://path/to/your/file.js");

// const a = () => {
//   console.log(123123123123, "????");
// };

// a();
var d = {};
var b = { current: {} };
Object.defineProperty(b, "current", {
  get: () => {
    return d;
  },
  set: (v) => {
    d = v;
  },
});
b.current = { a: 11 };
