import { filter } from 'rxjs';

interface RequestsData {
  date: string;
  count: number;
}

export function filterDataByDays(
  data: RequestsData[],
  days: number
): RequestsData[] {
  const currentDate = new Date();
  const dateAgo = new Date(currentDate);
  dateAgo.setDate(currentDate.getDate() - days);

  const dateData: RequestsData[] = [];

  for (
    let d = new Date(dateAgo);
    d <= currentDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dateString = d.toISOString().split('T')[0];

    const dayData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.toISOString().split('T')[0] === dateString;
    });

    dateData.push({
      date: dateString,
      count:
        dayData.length > 0
          ? dayData.reduce((acc, item) => acc + item.count, 0)
          : 0,
    });
  }

  return dateData;
}
