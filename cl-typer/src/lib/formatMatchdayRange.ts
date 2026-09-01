import { Fixture } from "@/lib/types";

export function formatMatchdayRange(list: Fixture[]): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dates = list.map((f) => new Date(f.kickoff));
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  const minDay = pad(min.getDate());
  const maxDay = pad(max.getDate());
  const minMonth = pad(min.getMonth() + 1);
  const maxMonth = pad(max.getMonth() + 1);
  const year = max.getFullYear();

  if (minDay === maxDay && minMonth === maxMonth) return `${minDay}.${minMonth}.${year}`;
  if (minMonth === maxMonth) return `${minDay}-${maxDay}.${minMonth}.${year}`;
  return `${minDay}.${minMonth}-${maxDay}.${maxMonth}.${year}`;
}
