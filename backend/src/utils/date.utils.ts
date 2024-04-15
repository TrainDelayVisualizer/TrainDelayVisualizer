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

    public static getMidnight(date: Date): Date {
      date = new Date(date);
      date.setHours(0, 0, 0, 0);

      return date;
    }

    public static getEndOfDay(date: Date): Date {
      date = new Date(date);
      date.setHours(23, 59, 59, 999);

      return date;
    }
  
    public static subtractDays(date: Date, days: number): Date {
      date = new Date(date);
      date.setDate(date.getDate() - days);
  
      return date;
    }

    public static addDays(date: Date, days: number): Date {
      date = new Date(date);
      date.setDate(date.getDate() + days);
  
      return date;
    }
}