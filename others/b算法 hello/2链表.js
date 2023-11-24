// 链表
// 链式结构
/**
 * 功能：
 * 1. 插入数据, 向后向前插入
 * 2. 取数据
 *  2.1 数据可访问下一个节点的数据，无则返回null/undefined
 *
 * 基础数据结构 Data: { value: any, next?: Data }
 * 实例方法：
 *  push: (value: any) => Data // 返回当前指针
 *  unshift = (value) => Data // 返回链表第一个元素
 *  getData = () => Data // 返回链表第一个元素
 *  size = () => number // 返回链表长度
 *  getBaseData = (value: any) => Data // 返回普通链表数据
 *
 * 静态方法
 * concat = (v1: Data, v2: Data) => [v1: Data, v2: Data] // 向下连接链表 v1.next = v2
 * getValue = (v: Data) => any // 取值
 * size = (v: Data) => v // 获取链表指定节点 到最后节点的长度
 * removeNext = (v: Data) => v // 删除当前节点的下一个节点
 *
 */

class MyLinkedList {
  constructor(initVal) {
    this.init = (initVal) => {
      this.data = initVal;
      this.head = this.data;
    };

    this.init(initVal !== undefined ? this.getBaseData(initVal) : undefined);

    // 向后连接表
    this.push = function (value) {
      const newList = this.getBaseData(value);
      if (!this.data) {
        this.init(newList);
        return this.head;
      }
      MyLinkedList.concat(this.head, newList);
      this.head = newList;
      return this.head;
    };

    // 向前插入链接表
    this.unshift = function (value) {
      const newList = this.getBaseData(value);
      MyLinkedList.concat(newList, this.data);
      this.data = newList;
      return this.data;
    };

    this.getData = () => this.data;

    this.size = () => MyLinkedList.size(this.data);

    this.getBaseData = (value) => {
      return {
        value,
        next: undefined,
      };
    };
  }

  // 向下连接表
  static concat(v1, v2) {
    v1.next = v2;
    return [v1, v2];
  }

  static getValue(data) {
    try {
      return data.value;
    } catch (error) {
      return undefined;
    }
  }

  static size(data) {
    if (!data) {
      return 0;
    }
    let len = 1;
    while (true) {
      if (!data.next) {
        return len;
      }
      ++len;
      data = data.next;
    }
  }
  // 删除Data后的一个节点
  static removeNext(data) {
    if (!data.next) return;
    data.next = data.next.next;
    return data.next;
  }
}

// 双向链表

/**
 * 和链表中的区别
 * 实例方法
 *  getBaseData = () => ({value: any, prev: undefined, next: undefined})
 * 静态方法
 *  concatPrev = (v1: Data, v2: Data) => [v1: Data, v2: Data] //向上连接链表 v1.prev = v2;
 *  sizeToTop = (v: Data) => number // 向上查找
 */
class MyDoublyLinkedList extends MyLinkedList {
  constructor(value) {
    super(value);
    this.getBaseData = (value) => {
      return {
        value,
        prev: undefined,
        next: undefined,
      };
    };
    this.push = (value) => {
      const newList = this.getBaseData(value);
      if (!this.data) {
        this.init(newList);
        return this.head;
      }
      MyLinkedList.concat(this.head, newList);
      MyDoublyLinkedList.concatPrev(newList, this.head);
      this.head = newList;
      return this.head;
    };
    this.unshift = (value) => {
      const newList = this.getBaseData(value);
      if (!this.data) {
        this.init(newList);
        return this.head;
      }
      MyLinkedList.concat(newList, this.data);
      MyDoublyLinkedList.concatPrev(this.data, newList);
      this.data = newList;
      return newList;
    };
  }
  static concatPrev = (v1, v2) => {
    v1.prev = v2;
    return [v1, v2];
  };
  // 删除Data后的一个节点
  static removeNext(data) {
    if (!data.next) return;
    data.next = data.next.next;
    // 此时 data.next 已经变成第三个节点了
    if (data.next) {
      data.next.prev = data;
    }
    return data.next;
  }
  static sizeToTop(data) {
    if (!data) {
      return 0;
    }
    let len = 1;
    while (true) {
      if (!data.prev) {
        return len;
      }
      ++len;
      data = data.prev;
    }
  }

  static getBaseData = (value) => {
    return {
      value,
      prev: undefined,
      next: undefined,
    };
  };
}
if (!window.exports) {
  window.exports = {};
}
exports.MyDoublyLinkedList = MyDoublyLinkedList;
exports.MyLinkedList = MyLinkedList;

const data = new MyDoublyLinkedList();
console.log(data.size());
data.push(1);
data.push(2);
data.push(3);
data.push(4);
data.push(5);
data.unshift(0);
console.log(data.size());
