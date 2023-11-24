/**
 *
 * 哈希表
 *
 * 固定桶 例如 100个桶
 * 通过固定方式换算 指向成桶编号
 */
class BaseData {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}
/**
 * 桶大小 100
 * 哈希值得出，只是简单的取余
 * 拥挤因数  5/100 如果当前储存的桶 超过5个，就扩容
 * 扩容因数 2
 */
class BaseHashMap {
  constructor() {
    this.bucketLength = 100;
    this.data = this.getBucket(this.bucketLength);
    this.saveDataCount = 0;
    // this.maximumCapacityRatio = 2 / 3; // 桶如果达到2/3的容量，则需要换扩容
    this.maximumCapacityRatio = 5 / 100;
    this.dilatationRatio = 2;
    this.delText = "del";
  }

  getBucket = (len) => {
    return new Array(len).fill(null);
  };

  dilatation = () => {
    this.bucketLength = this.dilatationRatio * this.bucketLength;
    const oldData = this.data;
    this.data = this.getBucket(this.bucketLength);
    this.saveDataCount = 0;
    oldData.forEach((item) => {
      item && this.set(item.key, item.value);
    });
  };

  checkBucketDilatation = () => {
    if (this.saveDataCount / this.bucketLength < this.maximumCapacityRatio) {
      return;
    }
    this.dilatation();
  };

  hash(key) {
    return key % this.bucketLength;
  }

  findRelData(key) {
    let relKey = this.hash(key);
    while (true) {
      const saveData = this.data[relKey];
      if (!saveData || saveData === this.delText) {
        return [saveData, relKey];
      }
      if (saveData?.key === key) {
        return [saveData, relKey];
      }
      console.log("冲突");
      relKey = (relKey + 1) % this.bucketLength;
    }
  }

  get(key) {
    const [data] = this.findRelData(key);
    return data?.value;
  }

  set(key, value) {
    this.checkBucketDilatation();
    this.saveDataCount++;
    const [saveData, relKey] = this.findRelData(key);
    if (!saveData || saveData === this.delText) {
      this.data[relKey] = new BaseData(key, value);
      return;
    }
    if (saveData.key === key) {
      this.data[relKey].value = value;
      return;
    }
  }

  del(key) {
    const [, relKey] = this.findRelData(key);
    this.data[relKey] = this.delText;
    this.saveDataCount--;
  }

  getAll() {
    return this.data.filter((item) => item);
  }
}

const data = new BaseHashMap();
data.set(12, 123);
data.set(13, 133);
data.set(14, 143);
data.set(23, 233);
