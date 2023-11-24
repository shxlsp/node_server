/**
 *
 * @param {string[] | [start:string, end:string, name?: string][]} matchingArr
 * @returns
 */
const dealwithMatchingArr = (matchingArr) => {
  let is2Deep = false;
  let index = 0;
  const baseMap = {};
  const lengthMap = {};
  const names = [];
  matchingArr.forEach((item, i) => {
    if (item instanceof Array) {
      is2Deep = true;
      const [fir, sec, name = i] = item;
      lengthMap[fir.length] = fir.length;
      lengthMap[sec.length] = sec.length;
      names[name] = [index, index + 1];
      names[index] = name;
      names[index + 1] = name;
      baseMap[fir] = index++;
      baseMap[sec] = index++;
      return;
    }
    if (is2Deep) throw new Error("数据格式错误 双层数组和单层数组混用");
    item = String(item);
    lengthMap[item.length] = item.length;
    baseMap[item] = index++;
  });
  if (index % 2 !== 0) throw new Error("数据格式错误 数据不是2的整数倍");
  Object.defineProperty(baseMap, "__lengthArr", {
    value: Object.values(lengthMap),
    enumerable: false,
  });
  Object.defineProperty(baseMap, "__names", {
    value: names,
    enumerable: false,
  });
  return baseMap;
};
const symbolMatching = (string, matchingArr = ["[", "]", "{", "}"]) => {
  const baseMap = dealwithMatchingArr(matchingArr);
  const symbolMap = reversal(baseMap);
  // console.log(symbolMap);
  let len = string.length;
  const list = new MyLinkedListStack();
  const matchingData = {};
  const getKeyNumAndLen = (index) => {
    let keyNum = undefined;
    let length = 0;
    baseMap.__lengthArr.some((len) => {
      const s = string.slice(index, index + len);
      length = len;
      keyNum = baseMap[s];

      if (keyNum !== undefined) {
        console.log(length, keyNum, s);
      }
      return keyNum !== undefined;
    });
    return [keyNum, length];
  };

  const getMatchingDataGroup = (key) => {
    const name = baseMap.__names[key] || "default";
    if (!matchingData[name]) {
      matchingData[name] = [];
    }
    return matchingData[name];
  };
  for (let i = 0; i < len; i++) {
    // const str = string[i];
    // const keyNum = baseMap[str];
    const [keyNum, length] = getKeyNumAndLen(i);
    // console.log(str, keyNum);
    if (keyNum === undefined) {
      continue;
    }

    if (keyNum % 2 === 1) {
      const size = list.getSize();
      // console.log(size, "???");
      if (size === 0) {
        // 偶数 且 为 0
        console.warn("括号匹配失败，括号数量问题, 例如 ( ( )");
        // return false;
        continue;
      }
      // console.log(list.peek(), keyNum, "?????");
      const data = list.peek();
      if (data.keyNum === keyNum - 1) {
        list.pop();
        const group = getMatchingDataGroup(keyNum);
        group.push([
          {
            key: symbolMap[data.keyNum],
            index: data.index,
            length: data.length, // 这里用栈中弹出的数据
          },
          { key: symbolMap[keyNum], index: i, length }, // 这里的length用本次循环得到的length
        ]);
        continue;
      } else {
        console.log("不合规的括号类型：例如 ( { ) }");
        return false;
      }
    }
    // console.log(i, keyNum, "push");
    list.push({ keyNum, index: i, length: length });
  }
  // 提供一些不可便利的方法
  Object.defineProperties(matchingData, {
    __oldStr: {
      value: string,
      writable: false,
      enumerable: false,
    },
    __map: {
      value: function (cb) {
        const data = {};
        Object.keys(this).forEach((key) => {
          data[key] = this[key].map((item, index) => {
            return cb(item, index);
          });
        });
        return data;
      },
      enumerable: false,
    },
    getStrArrFull: {
      value: function () {
        return this.__map((item) =>
          this.__oldStr.slice(item[0].index, item[1].index + item[1].length)
        );
      },
      enumerable: false,
    },
    getStrArrMiddle: {
      value: function () {
        return this.__map((item) =>
          this.__oldStr.slice(item[0].index + item[0].length + 1, item[1].index)
        );
      },
      enumerable: false,
    },
  });
  // console.log(zu, "zuuuuu");
  return matchingData;
};

const reversal = (data) => {
  const newData = {};
  for (let key in data) {
    newData[data[key]] = key;
    newData[key] = data[key];
  }
  return newData;
};

// 栈
class MyLinkedListStack {
  constructor() {
    this.data = null;
    this.size = 0;
  }
  push = (data) => {
    const node = {
      value: data,
      next: this.data,
    };
    this.data = node;
    this.size++;
  };

  pop() {
    const data = this.peek();
    if (data) {
      this.size--;
      this.data = this.data.next;
    }
    return data;
  }

  getSize() {
    return this.size;
  }

  peek() {
    return this.data?.value;
  }
}
//74805
//链表
class LinkedList {
  constructor(initData) {
    this.data = {
      value: initData,
      next: {},
    };
  }

  insert = (n0, p) => {
    const n1 = n0.next;
    n0.next = p;
    p.next = n1;
  };

  remove = (n0) => {
    if (!n0.next) return;
    // n0 -> P -> n1
    const P = n0.next;
    const n1 = P.next;
    n0.next = n1;
  };
}
// 测试代码
// const str = "[11]{1{abc}2}[vvv]<ul>123</ul>";
// const match = symbolMatching(str, [["<ul", "</ul>"]]);
// console.log(match?.getStrArrFull(), match?.__oldStr, "????", match);

// match &&
//   match.map((item) => {
//     console.log(str.slice(item[0].index, item[1].index + item[1].length));
//   });

// console.log(
//   dealwithMatchingArr([["<ul ", "</ul>"]]),
//   dealwithMatchingArr([["<ul ", "</ul>"]])
// );
exports.symbolMatching = symbolMatching;
