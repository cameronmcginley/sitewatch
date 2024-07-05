import { useState, useEffect } from "react";
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";

// export const useFormattedDate = (date) => {
//   const [formattedDate, setFormattedDate] = useState("");

//   useEffect(() => {
//     if (date) {
//       setFormattedDate(format(new Date(date), "yyyy-MM-dd HH:mm"));
//     }
//   }, [date]);

//   return formattedDate;
// };

// export const useTimeAgo = (date) => {
//   const [timeAgo, setTimeAgo] = useState("");

//   useEffect(() => {
//     if (date) {
//       setTimeAgo(
//         formatDistanceToNowStrict(new Date(date), { addSuffix: true })
//       );
//     }
//   }, [date]);

//   return timeAgo;
// };

// export const useFormattedFrequency = (milliseconds) => {
//   const [formattedFrequency, setFormattedFrequency] = useState("");

//   useEffect(() => {
//     const units = [
//       { label: "month", value: 30 * 24 * 60 * 60 * 1000 },
//       { label: "week", value: 7 * 24 * 60 * 60 * 1000 },
//       { label: "day", value: 24 * 60 * 60 * 1000 },
//       { label: "hour", value: 60 * 60 * 1000 },
//       { label: "minute", value: 60 * 1000 },
//     ];

//     let remainingTime = milliseconds;
//     const result = [];

//     units.forEach((unit) => {
//       const unitValue = Math.floor(remainingTime / unit.value);
//       if (unitValue > 0) {
//         result.push(`${unitValue} ${unit.label}${unitValue > 1 ? "s" : ""}`);
//         remainingTime %= unit.value;
//       }
//     });

//     setFormattedFrequency(result.join(", "));
//   }, [milliseconds]);

//   return formattedFrequency;
// };
