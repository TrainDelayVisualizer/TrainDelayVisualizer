export class ListUtils {
    static distinctBy<T, TKey>(array: T[], keySelector: (item: T) => TKey): T[] {
        const keys = new Set<TKey>();
        const result = new Array<T>();
        for (const item of array) {
            const key = keySelector(item);
            if (!keys.has(key)) {
                keys.add(key);
                result.push(item);
            }
        }
        return result;
    }

    static chunk<T>(array: T[], chunkSize: number): T[][] {
        return array.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / chunkSize);
            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }
            resultArray[chunkIndex].push(item);
            return resultArray;
        }, [] as T[][]);
    }
}