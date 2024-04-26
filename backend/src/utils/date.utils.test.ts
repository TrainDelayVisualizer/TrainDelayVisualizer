import { DateUtils } from './date.utils';

describe(DateUtils.name, () => {
  describe('getTimestampFromString', () => {

    it('should return the timestamp of the date string', () => {
      const dateTime = '2021-01-01T00:00:00Z';
      const result = DateUtils.getTimestampFromString(dateTime);

      expect(result).toBe(1609459200000);
    });

    it('should return NaN if the date string is invalid', () => {
      const dateTime = 'invalid';
      const result = DateUtils.getTimestampFromString(dateTime);

      expect(result).toBe(NaN);
    });
  });

  describe('getDateTimeFromString', () => {

    it('should return the date of the date string', () => {
      const dateTime = '25.04.2024 06:05';
      const result = DateUtils.getDateTimeFromString(dateTime);

      // utc is 2 hours ahead of the given time
      expect(result).toEqual(new Date('2024-04-25T04:05:00Z'));
    });

    it('should return the date with seconds of the date string', () => {
      const dateTime = '25.04.2024 06:05:01';
      const result = DateUtils.getDateTimeFromString(dateTime);

      // utc is 2 hours ahead of the given time
      expect(result).toEqual(new Date('2024-04-25T04:05:00Z'));
    });

    it('should return null if the date string is null', () => {
      const dateTime = null;
      const result = DateUtils.getDateTimeFromString(dateTime);

      expect(result).toBeNull();
    });

    it('should return null if the date string is invalid', () => {
      const dateTime = 'invalid';
      const result = DateUtils.getDateTimeFromString(dateTime);

      expect(result).toBeNull();
    });
  });

  describe('getMidnight', () => {
    it('should return the date with midnight time (00:00:00)', () => {
      const date = new Date('2021-01-01T12:34:56Z');
      const result = DateUtils.getMidnight(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should not modify the original date object', () => {
      const date = new Date('2021-01-01T12:34:56Z');
      const originalDate = new Date(date);
      DateUtils.getMidnight(date);

      expect(date).toEqual(originalDate);
    });
  });

  describe('getEndOfDay', () => {
    it('should return the date with the end of the day time (23:59:59.999)', () => {
      const date = new Date('2021-01-01T12:34:56Z');
      const result = DateUtils.getEndOfDay(date);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should not modify the original date object', () => {
      const date = new Date('2021-01-01T12:34:56Z');
      const originalDate = new Date(date);
      DateUtils.getEndOfDay(date);

      expect(date).toEqual(originalDate);
    });
  });

  describe('subtractDays', () => {
    it('should subtract the specified number of days from the given date', () => {
      const date = new Date('2021-01-10T00:00:00Z');
      const days = 5;
      const result = DateUtils.subtractDays(date, days);

      expect(result).toEqual(new Date('2021-01-05T00:00:00Z'));
    });

    it('should not modify the original date object', () => {
      const date = new Date('2021-01-10T00:00:00Z');
      const originalDate = new Date(date);
      const days = 5;
      DateUtils.subtractDays(date, days);

      expect(date).toEqual(originalDate);
    });
  });

});