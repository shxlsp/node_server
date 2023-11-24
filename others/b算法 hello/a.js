const dealwithMatchingArr = (matchingArr) => {
  let is2Deep = false;
  let index = 0;
  const baseMap = {};
  const lengthMap = {};
  matchingArr.forEach((item) => {
    if (item instanceof Array) {
      is2Deep = true;
      if (item.length > 2)
        throw new Error("数据格式错误 双层数组中，inner数组长度超过2");
      const [fir, sec] = item;
      lengthMap[fir.length] = fir.length;
      lengthMap[sec.length] = sec.length;
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
  return baseMap;
};
const symbolMatching = (string, matchingArr) => {
  const baseMap = {
    "[": 0,
    "]": 1,
    "{": 2,
    "}": 3,
  };
  const symbolMap = reversal(baseMap);
  console.log(symbolMap);
  let len = string.length;
  const list = new MyLinkedListStack();
  const zu = [];
  for (let i = 0; i < len; i++) {
    const str = string[i];
    const keyNum = baseMap[str];
    // console.log(str, keyNum);
    if (keyNum === undefined) {
      continue;
    }
    if (keyNum % 2 === 1) {
      const size = list.getSize();
      // console.log(size, "???");
      if (size === 0) {
        // 偶数 且 为 0
        console.log("括号匹配失败，括号数量问题, 例如 ( ( )");
        return false;
      }
      // console.log(list.peek(), keyNum, "?????");
      const data = list.peek();
      if (data.keyNum === keyNum - 1) {
        list.pop();
        zu.push([
          { key: symbolMap[data.keyNum], index: data.index },
          { key: symbolMap[keyNum], index: i },
        ]);
        continue;
      } else {
        console.log("不合规的括号类型：例如 ( { ) }");
        return false;
      }
    }
    // console.log(i, keyNum, "push");
    list.push({ keyNum, index: i });
  }
  // console.log(zu, "zuuuuu");
  return zu;
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
const str = "[11]{1{abc}2}[vvv]";
const match = symbolMatching(str);
console.log(match, "????");

match &&
  match.map((item) => {
    console.log(str.slice(item[0].index + 1, item[1].index));
  });

console.log(dealwithMatchingArr([["<ul ", "</ul>"]]));
// exports = symbolMatching;
