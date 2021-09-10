import { makeAutoObservable } from "mobx"

export class TestStore {
  isBool = false;
  isNum = 1;
  isString = "";
  isObj: { count: number;[key: string]: any; } = { count: 0 };
  isArr: any[] = [];
  isClass = new TestClass('foo')

  constructor() {
    makeAutoObservable(this);
  }

  setBool(value: boolean) {
    this.isBool = value;
  }
  setNum(value: number) {
    this.isNum = value;
  }
  setString(value: string) {
    this.isString = value;
  }
  setObj(value: string) {
    this.isObj[value] = value;
  }
  setCount() {
    this.isObj.count++
  }
  appendArr(value: any) {
    this.isArr.push(value);
  }
  replaceArr(arr: string[]) {
    this.isArr = arr;
  }


  appendClass(value: string) {
    this.isArr.push(new TestClass(value))
  }

  setClass(value: string) {
    this.isClass = new TestClass(value);
  }

  changeClass(value: string) {
    this.isClass.changeAttr(value);
  }
}

class TestClass {
  attr: string

  constructor(val: string) {
    makeAutoObservable(this);
    this.attr = val;
  }

  changeAttr(val: string) {
    this.attr = val;
  }
}
