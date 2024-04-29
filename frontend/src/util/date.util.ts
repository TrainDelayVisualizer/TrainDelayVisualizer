export function getMidnightYesterday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
  return d;
}