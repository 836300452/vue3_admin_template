// 深拷贝
export const deepClone = (target: any) => {
  let result //克隆后返回的对象
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = []
      for (const i in target) {
        result.push(deepClone(target[i]))
      }
    } else if (target === null) {
      result = null
    } else if (target.constructor === RegExp || target.constructor === Date) {
      //正则或者日期形式
      result = target
    } else {
      //进入此分支，说明是一个对象
      result = {}
      for (const i in target) {
        result[i] = deepClone(target[i])
      }
    }
  } else {
    //进入次分支说明当前的target是number、boolean、string之类的类型
    result = target
  }
  return result
}
