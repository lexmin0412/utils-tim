/**
 * 打印
 * @param info 需要打印的信息
 */
export const timLog = (...rest) => {
  if ([...rest].length > 0) {
    console.log('TIM-UTIL', ...rest)
  }
}