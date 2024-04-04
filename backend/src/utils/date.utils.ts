export class DateUtils {

    public static getTimestampFromString(dateTime: string): number {
        return new Date(dateTime).getTime();
    }

    public static getDateTimeFromString(dateTime: string | null): Date | null {
      if (dateTime === null) {
        return null;
      }

      const date = new Date(dateTime);

      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    }
}