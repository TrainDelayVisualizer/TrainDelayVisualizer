export function getMidnightYesterday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
  return d;
}

export function getEndOfDayYesterday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
  return d;
}

export function getMidnight(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function getEndOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}