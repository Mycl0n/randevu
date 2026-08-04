export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export const DAYS_OF_WEEK = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "İptal", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Tamamlandı", color: "bg-blue-100 text-blue-800" },
  NO_SHOW: { label: "Gelmedi", color: "bg-gray-100 text-gray-800" },
};

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  duration: number,
  bookedSlots: { start: Date; end: Date }[]
): string[] {
  const slots: string[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  const start = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  for (let minutes = start; minutes + duration <= end; minutes += 15) {
    const slotStart = minutes;
    const slotEnd = minutes + duration;

    const isBooked = bookedSlots.some((bs) => {
      const bsStart = bs.start.getHours() * 60 + bs.start.getMinutes();
      const bsEnd = bs.end.getHours() * 60 + bs.end.getMinutes();
      return slotStart < bsEnd && slotEnd > bsStart;
    });

    if (!isBooked) {
      const h = Math.floor(slotStart / 60)
        .toString()
        .padStart(2, "0");
      const m = (slotStart % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }

  return slots;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}