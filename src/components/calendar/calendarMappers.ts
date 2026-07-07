import type { EventInput } from "@fullcalendar/core";
import type { CalendarEventDto } from "../../api/types";
import type { CalendarEvent } from "../../config/calendar";

const OUTLOOK_COLORS: Record<string, string> = {
  auto: "#2563eb",
  lightBlue: "#0ea5e9",
  lightGreen: "#22c55e",
  lightOrange: "#f97316",
  lightGray: "#64748b",
  lightYellow: "#eab308",
  lightTeal: "#14b8a6",
  lightPink: "#ec4899",
  lightBrown: "#a16207",
  lightRed: "#ef4444",
  maxColor: "#7c3aed",
};

export function outlookColorToHex(color?: string | null): string {
  if (!color) return "#2563eb";
  if (color.startsWith("#")) return color;
  return OUTLOOK_COLORS[color] ?? "#2563eb";
}

export function mapOutlookEventToFullCalendar(event: CalendarEventDto): EventInput {
  return {
    id: event.graphId,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    allDay: event.isAllDay,
    backgroundColor: outlookColorToHex(event.color),
    borderColor: outlookColorToHex(event.color),
    extendedProps: {
      source: "outlook",
      calendarId: event.calendarId,
      location: event.location,
      description: event.description,
      onlineMeetingUrl: event.onlineMeetingUrl,
      webLink: event.webLink,
      organizerName: event.organizerName,
      canEdit: event.canEdit,
    },
  };
}

export function mapBirthdayToFullCalendar(event: CalendarEvent): EventInput {
  return {
    id: event.id,
    title: event.title,
    start: event.date,
    allDay: true,
    backgroundColor: "#db2777",
    borderColor: "#db2777",
    editable: false,
    extendedProps: {
      source: "birthday",
      href: event.href,
      description: event.description,
      canEdit: false,
    },
  };
}

export function dtoToModalEvent(event: CalendarEventDto) {
  return {
    graphId: event.graphId,
    calendarId: event.calendarId,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    isAllDay: event.isAllDay,
    location: event.location ?? "",
    description: event.description ?? "",
    webLink: event.webLink ?? "",
    onlineMeetingUrl: event.onlineMeetingUrl ?? "",
    canEdit: event.canEdit,
  };
}

export type CalendarModalEvent = ReturnType<typeof dtoToModalEvent>;
