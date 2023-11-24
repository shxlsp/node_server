const { MyDoublyLinkedList } = require("./2链表");

class MyDoublyQueue {
  constructor() {
    this.base = new MyDoublyLinkedList();
  }

  get head() {
    return this.base.head;
  }
  set head(v) {
    this.base.head = v;
  }
  get data() {
    return this.base.data;
  }

  set data(value) {
    this.base.data = value;
  }

  push(v) {
    this.base.push(v);
  }

  pop() {
    const el = this.head;
    if (!el) return;
    this.head = el.prev;
    // 清空上一个元素 向下查找的链接
    this.head.next = undefined;
    return el.value;
  }

  unshift(v) {
    this.base.unshift(v);
  }

  shift() {
    const el = this.data;
    if (!el) return;
    this.data = el.next;
    // 清空下一个元素 向上查找的链接
    this.data.prev = undefined;
    return el.value;
  }

  size() {
    return MyDoublyLinkedList.size(this.data);
  }
}
