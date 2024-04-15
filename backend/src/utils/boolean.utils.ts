export class BooleanUtils {

    static convertToBoolean(value: boolean | string): boolean {
        if (value === true || value === 'true') {
            return true;
        }
        if (value === false || value === 'false') {
            return false;
        }
        throw new Error(`Cannot convert value to boolean: ${value}`);
    }
}