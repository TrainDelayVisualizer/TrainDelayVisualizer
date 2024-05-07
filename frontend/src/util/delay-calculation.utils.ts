export class DelayCalculationUtils {

    static calculateDelayInfo(delayInSeconds: number) {
        const delayMinutes = Math.floor(delayInSeconds / 60);
        const delaySeconds = delayInSeconds % 60;
        return {
            delayMinutes,
            delaySeconds,
            delayColor: this.getDelayColor(delayMinutes)
        };
    }

    static getDelayColor(delayInMinutes: number) {
        return delayInMinutes >= 2 ? "red" : delayInMinutes >= 1 ? "orange" : "green";
    }
}