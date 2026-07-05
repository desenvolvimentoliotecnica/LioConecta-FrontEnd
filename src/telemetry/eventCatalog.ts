export const TelemetryEventNames = {
  Navigation: {
    PageViewed: "Navigation.PageViewed",
    PageLeft: "Navigation.PageLeft",
  },
  Application: {
    Error: "Application.Error",
    UnhandledRejection: "Application.UnhandledRejection",
    NetworkError: "Application.NetworkError",
  },
  Action: {
    Performed: "Action.Performed",
    Export: "Action.Export",
    Download: "Action.Download",
    Search: "Action.Search",
  },
  Resource: {
    Viewed: "Resource.Viewed",
  },
} as const;

export type TelemetryEventType = "Application" | "Navigation" | "Action" | "Resource";

export const TelemetrySeverity = {
  Trace: 0,
  Debug: 1,
  Information: 2,
  Warning: 3,
  Error: 4,
  Critical: 5,
} as const;
