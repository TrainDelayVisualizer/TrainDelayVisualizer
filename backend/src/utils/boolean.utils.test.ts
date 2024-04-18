import { BooleanUtils } from './boolean.utils';

describe(BooleanUtils.name, () => {
  describe('convertToBoolean', () => {
    it('should return true if the value is true', () => {
      const value = true;
      const result = BooleanUtils.convertToBoolean(value);

      expect(result).toBe(true);
    });

    it('should return false if the value is false', () => {
      const value = false;
      const result = BooleanUtils.convertToBoolean(value);

      expect(result).toBe(false);
    });

    it('should return true if the value is "true"', () => {
      const value = 'true';
      const result = BooleanUtils.convertToBoolean(value);

      expect(result).toBe(true);
    });

    it('should return false if the value is "false"', () => {
      const value = 'false';
      const result = BooleanUtils.convertToBoolean(value);

      expect(result).toBe(false);
    });

    it('should throw an error if the value is neither true nor false', () => {
      const value = 'invalid';
      expect(() => {
        BooleanUtils.convertToBoolean(value);
      }).toThrowError('Cannot convert value to boolean: invalid');
    });
  });
});