//@flow

export const hasFlag = (bitmask: number, flag: number): boolean => {
  return (bitmask & flag) === flag
}
