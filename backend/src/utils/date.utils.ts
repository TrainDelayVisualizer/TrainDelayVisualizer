import moment from "moment-timezone";

export class DateUtils {

  public static getTimestampFromString(dateTime: string): number {
    return new Date(dateTime).getTime();
  }

  public static getDateTimeFromIstDatenCsvFormat(dateTime: string | null): Date | null {
    if (dateTime === null) {
      return null;
    }
    const parts = dateTime.split(/[. :]/);
    const momentDate = moment.tz([+parts[2], +parts[1] - 1, +parts[0], +parts[3], +parts[4]], 'Europe/Berlin');
    const date = momentDate.toDate();

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
}