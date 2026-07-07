import { describe, expect, it } from "vitest";
import type { CalendarEventDto } from "../../api/types";
import { mapOutlookEventToFullCalendar } from "../../components/calendar/calendarMappers";

describe("calendarMappers", () => {
  it("maps Outlook DTO to FullCalendar event", () => {
    const dto: CalendarEventDto = {
      graphId: "evt-1",
      calendarId: "cal-1",
      title: "Reunião",
      startAt: "2026-07-07T10:00:00.000Z",
      endAt: "2026-07-07T11:00:00.000Z",
      isAllDay: false,
      location: "Sala A",
      description: "Alinhamento",
      onlineMeetingUrl: null,
      webLink: "https://outlook.office.com/event",
      organizerName: "Maria",
      organizerEmail: "maria@liotecnica.com.br",
      source: "Outlook",
      color: "lightBlue",
      canEdit: true,
    };

    const mapped = mapOutlookEventToFullCalendar(dto);
    expect(mapped.id).toBe("evt-1");
    expect(mapped.title).toBe("Reunião");
    expect(mapped.allDay).toBe(false);
    expect(mapped.extendedProps?.canEdit).toBe(true);
  });
});
