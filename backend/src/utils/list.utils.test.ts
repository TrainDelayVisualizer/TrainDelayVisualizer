import { ListUtils } from './list.utils';

describe('ListUtils', () => {
  describe('distinctBy', () => {
    it('should return an array with distinct items based on the key selector', () => {
      const array = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'John' },
        { id: 4, name: 'Jane' },
      ];
      const keySelector = (item: { id: number, name: string }) => item.name;

      const result = ListUtils.distinctBy(array, keySelector);

      expect(result).toEqual([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]);
    });

    it('should return an empty array if the input array is empty', () => {
      const array: { name: string }[] = [];
      const keySelector = (item: { name: string }) => item;

      const result = ListUtils.distinctBy(array, keySelector);

      expect(result).toEqual([]);
    });
  });

  describe('chunk', () => {
    it('should return an array of chunks with the specified chunk size', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunkSize = 3;

      const result = ListUtils.chunk(array, chunkSize);

      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10],
      ]);
    });

    it('should return an empty array if the input array is empty', () => {
      const array: { name: string }[] = [];
      const chunkSize = 3;

      const result = ListUtils.chunk(array, chunkSize);

      expect(result).toEqual([]);
    });
  });
});

describe('removeNulls', () => {
  it('should return an array without null values', () => {
    const array = [1, null, 2, null, 3, null];
    const result = ListUtils.removeNulls(array);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should return an empty array if the input array is empty', () => {
    const array: { name: string }[] = [];
    const result = ListUtils.removeNulls(array);

    expect(result).toEqual([]);

  })
});

describe('groupBy', () => {
  it('should group items in the array based on the key selector', () => {
    const array = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'John' },
      { id: 4, name: 'Jane' },
    ];
    const keySelector = (item: { id: number, name: string }) => item.name;

    const result = ListUtils.groupBy(array, keySelector);

    expect(result.size).toBe(2);
    expect(result.get('John')).toEqual([
      { id: 1, name: 'John' },
      { id: 3, name: 'John' },
    ]);
    expect(result.get('Jane')).toEqual([
      { id: 2, name: 'Jane' },
      { id: 4, name: 'Jane' },
    ]);
  });

  it('should return an empty map if the input array is empty', () => {
    const array: { name: string }[] = [];
    const keySelector = (item: { name: string }) => item.name;

    const result = ListUtils.groupBy(array, keySelector);

    expect(result.size).toBe(0);
  });
});
