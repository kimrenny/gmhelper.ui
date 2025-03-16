interface RequestsData {
  date: string;
  count: number;
}

export function processData(
  filteredData: RequestsData[],
  periodLength: number,
  isMonthly: boolean
): RequestsData[] {
  if (filteredData.length < 1) return [];

  const data: { [key: string]: number } = {};

  filteredData.forEach(({ date, count }) => {
    const key = isMonthly ? date.slice(0, 7) : date.slice(0, 4);
    data[key] = (data[key] || 0) + count;
  });

  let result = Object.entries(data)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const now = new Date();
  const lastPeriod: string[] = [];

  for (let i = periodLength - 1; i >= 0; i--) {
    const date = new Date(now);

    if (isMonthly) {
      date.setMonth(now.getMonth() - i);
      const periodKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      lastPeriod.push(periodKey);
    } else {
      date.setFullYear(now.getFullYear() - i);
      const periodKey = `${date.getFullYear()}`;
      lastPeriod.push(periodKey);
    }
  }

  lastPeriod.forEach((period) => {
    if (!result.some((d) => d.date === period)) {
      result.push({ date: period, count: 0 });
    }
  });

  result.sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
