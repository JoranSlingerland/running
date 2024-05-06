export function bisectLeft(
  arr: number[],
  value: number,
  lo = 0,
  hi = arr.length,
) {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < value) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}
