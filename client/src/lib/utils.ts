import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price / 1000}K`;
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export const timeSlots = [
  "6:00 - 7:00",
  "7:00 - 8:00",
  "8:00 - 9:00",
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00"
];

export const skillLevels = [
  { value: "beginner", label: "Sơ cấp" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" }
];

export function getSkillLevelLabel(level?: string): string {
  if (!level) return "Chưa xác định";
  const found = skillLevels.find(l => l.value === level);
  return found ? found.label : "Chưa xác định";
}

export const timeRanges = [
  { value: "morning", label: "Sáng (6:00 - 12:00)" },
  { value: "afternoon", label: "Chiều (12:00 - 18:00)" },
  { value: "evening", label: "Tối (18:00 - 22:00)" },
  { value: "any", label: "Bất kỳ" }
];

export function getTimeRangeLabel(range?: string): string {
  if (!range) return "Bất kỳ";
  const found = timeRanges.find(t => t.value === range);
  return found ? found.label : "Bất kỳ";
}
