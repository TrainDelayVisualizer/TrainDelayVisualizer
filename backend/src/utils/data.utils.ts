import { isEqual } from "lodash";

export class DataUtils {

    /**
     * Splits the input lists into new and existing items. The comparison is done by the compareKeySelector.
     * @param inputList the list of items that should be split into new and existing items
     * @param existingItemsList the list of items that are already in the db
     * @param compareKeySelector the key to compare the items
     * @returns a tuple with the first item being the new items and the second item being the existing items with changes
     */
    public static splitIntoNewAndExistingItemsWithChanges<TDataType, TKey>(inputList: TDataType[],
        existingItemsList: TDataType[], compareKeySelector: (item: TDataType) => TKey): [TDataType[], TDataType[]] {
        const returnValExisting: TDataType[] = [];
        const returnValNew: TDataType[] = [];

        for (let inputTrainStation of inputList) {
            const existingDbItem = existingItemsList.find(x => compareKeySelector(x) === compareKeySelector(inputTrainStation));
            if (existingDbItem) {
                // current item already exists in db
                if (!isEqual(existingDbItem, inputTrainStation)) {
                    returnValExisting.push(inputTrainStation);
                }
            } else {
                // current item does not exist in db
                returnValNew.push(inputTrainStation);
            }
        }
        return [returnValNew, returnValExisting];
    }
}