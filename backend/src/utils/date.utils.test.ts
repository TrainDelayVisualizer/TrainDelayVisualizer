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
      const dateTime = '2021-01-01T00:00:00Z';
      const result = DateUtils.getDateTimeFromString(dateTime);

      expect(result).toEqual(new Date('2021-01-01T00:00:00Z'));
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

});
