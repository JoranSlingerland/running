export function bisectLeft(
  arr: number[] | undefined,
  value: number | undefined,
  lo = 0,
  hi = arr?.length || 0,
) {
  if (!arr || !value) {
    return 0;
  }
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
