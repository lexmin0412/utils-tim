/**
 * 打印
 * @param info 需要打印的信息
 */
export const timLog = (...rest) => {
  if ([...rest].length > 0) {
    console.log('TIM-UTIL', ...rest)
  }
}

/**
 * 提取对象属性，返回新对象
 * @param {object} obj 提取对象
 * @param {Array} propArr 键值数组
 */
export const picSthFromObj = (obj: any, propArr: Array<any>) => {
  const newObj: any = {}
  propArr.forEach((item) => {
    newObj[item] = obj[item]
  })
  return newObj
}