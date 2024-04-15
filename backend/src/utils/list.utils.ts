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

    static groupBy<T, TKey>(array: T[], keySelector: (item: T) => TKey): Map<TKey, T[]> {
        return array.reduce((map, item) => {
            const key = keySelector(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
            return map;
        }, new Map<TKey, T[]>());
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

    static removeNulls<T>(array: (T | null)[]): T[] {
        return array.filter(x => x !== null) as T[];
    }
}