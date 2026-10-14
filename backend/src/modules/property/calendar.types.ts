export interface CalendarDayItemDto {
  date: string;
  price: number;
  isAvailable: boolean;
  reason: string | null;
}

export interface CalendarResponseDataDto {
  roomId: string;
  basePrice: number;
  calendar: CalendarDayItemDto[];
}
