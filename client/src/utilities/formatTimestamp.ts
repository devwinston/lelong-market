const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const formatTimestamp = (timestampString: string): string => {
  const date = new Date(timestampString);

  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const formattedDate = `${day}, ${date.getDate()} ${month} ${
    date.getFullYear() % 100
  }, ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return formattedDate;
};
