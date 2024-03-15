import { NumberUtils } from './number.utils';

describe('NumberUtils', () => {
  describe('roundByDecimals', () => {
    it('should round the number to the specified decimal places', () => {
      const value = 3.14159;
      const decimals = 2;
      const expected = 3.14;

      const result = NumberUtils.roundByDecimals(value, decimals);

      expect(result).toEqual(expected);
    });

    it('should round the number to 0 decimal places', () => {
      const value = 3.14159;
      const decimals = 0;
      const expected = 3;

      const result = NumberUtils.roundByDecimals(value, decimals);

      expect(result).toEqual(expected);
    });

    it('should round the number to 4 decimal places', () => {
      const value = 3.14159;
      const decimals = 4;
      const expected = 3.1416;

      const result = NumberUtils.roundByDecimals(value, decimals);

      expect(result).toEqual(expected);
    });
  });
});