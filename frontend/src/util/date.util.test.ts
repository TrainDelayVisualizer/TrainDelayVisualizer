import { getMidnightYesterday } from './date.util';

describe('getMidnightYesterday', () => {
  it('should return the midnight of yesterday', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    expect(getMidnightYesterday()).toEqual(yesterday);
  });
});
