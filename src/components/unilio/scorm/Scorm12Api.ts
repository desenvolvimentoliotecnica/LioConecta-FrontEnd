import type { UniLioScormRuntimeDto, UniLioScormRuntimeUpdate } from "../../../api/hooks/useUniLioScormRuntime";

type CommitCallback = (update: UniLioScormRuntimeUpdate) => void;

const SCORM_TRUE = "true";
const SCORM_FALSE = "false";

const ERROR_NONE = "0";
const ERROR_GENERAL = "101";
const ERROR_NOT_INITIALIZED = "301";
const ERROR_ELEMENT_NOT_IMPLEMENTED = "401";
const ERROR_ELEMENT_CANNOT_HAVE_CHILDREN = "402";

const ERROR_STRINGS: Record<string, string> = {
  "0": "No error",
  "101": "General exception",
  "201": "Invalid argument error",
  "202": "Element cannot have children",
  "203": "Element not an array",
  "301": "Not initialized",
  "401": "Not implemented error",
  "402": "Invalid set value, element is a keyword",
  "403": "Element is read-only",
  "404": "Element is write-only",
  "405": "Incorrect data type",
};

/** Convert seconds elapsed to SCORM session time string HH:MM:SS */
function secondsToSessionTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export class Scorm12Api {
  private initialized = false;
  private finished = false;
  private lastError = ERROR_NONE;
  private sessionStart = Date.now();

  private cmi: Record<string, string> = {
    "cmi.core._children": "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,exit,session_time",
    "cmi.core.student_id": "",
    "cmi.core.student_name": "",
    "cmi.core.lesson_location": "",
    "cmi.core.credit": "credit",
    "cmi.core.lesson_status": "not attempted",
    "cmi.core.entry": "ab-initio",
    "cmi.core.exit": "",
    "cmi.core.session_time": "00:00:00",
    "cmi.core.total_time": "00:00:00",
    "cmi.core.score._children": "raw,min,max",
    "cmi.core.score.raw": "",
    "cmi.core.score.min": "",
    "cmi.core.score.max": "100",
    "cmi.suspend_data": "",
    "cmi.launch_data": "",
    "cmi.comments": "",
    "cmi.comments_from_lms": "",
    "cmi.objectives._count": "0",
    "cmi.interactions._count": "0",
    "cmi.student_preference._children": "audio,language,speed,text",
    "cmi.student_preference.audio": "0",
    "cmi.student_preference.language": "",
    "cmi.student_preference.speed": "0",
    "cmi.student_preference.text": "0",
    "cmi.student_data._children": "mastery_score,max_time_allowed,time_limit_action",
    "cmi.student_data.mastery_score": "",
    "cmi.student_data.max_time_allowed": "",
    "cmi.student_data.time_limit_action": "",
  };

  private readonly onCommit: CommitCallback;

  constructor(runtime: UniLioScormRuntimeDto, onCommit: CommitCallback) {
    this.onCommit = onCommit;
    this.prefill(runtime);
  }

  private sanitizeCmiString(value: string | null | undefined, fallback = ""): string {
    const trimmed = (value ?? "").trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
      return fallback;
    }
    return trimmed;
  }

  private prefill(runtime: UniLioScormRuntimeDto): void {
    this.cmi["cmi.core.student_id"] = runtime.studentId;
    this.cmi["cmi.core.student_name"] = runtime.studentName;
    this.cmi["cmi.core.lesson_status"] = this.sanitizeCmiString(
      runtime.lessonStatus,
      "not attempted",
    );
    this.cmi["cmi.core.lesson_location"] = this.sanitizeCmiString(runtime.lessonLocation);
    this.cmi["cmi.suspend_data"] = this.sanitizeCmiString(runtime.suspendData);

    if (runtime.scoreRaw != null) {
      this.cmi["cmi.core.score.raw"] = String(runtime.scoreRaw);
    }
    if (runtime.scoreMin != null) {
      this.cmi["cmi.core.score.min"] = String(runtime.scoreMin);
    }
    if (runtime.scoreMax != null) {
      this.cmi["cmi.core.score.max"] = String(runtime.scoreMax);
    }
    if (runtime.passingScore != null) {
      this.cmi["cmi.student_data.mastery_score"] = String(runtime.passingScore);
    }

    const entry =
      runtime.lessonStatus === "incomplete" || runtime.lessonStatus === "browsed"
        ? "resume"
        : "ab-initio";
    this.cmi["cmi.core.entry"] = entry;
  }

  private buildUpdate(finish: boolean): UniLioScormRuntimeUpdate {
    const sessionSec = (Date.now() - this.sessionStart) / 1000;
    const sessionTime = secondsToSessionTime(sessionSec);
    this.cmi["cmi.core.session_time"] = sessionTime;

    const scoreRawStr = this.cmi["cmi.core.score.raw"];
    const scoreMinStr = this.cmi["cmi.core.score.min"];
    const scoreMaxStr = this.cmi["cmi.core.score.max"];

    return {
      lessonStatus: this.cmi["cmi.core.lesson_status"],
      scoreRaw: scoreRawStr !== "" ? Number(scoreRawStr) : null,
      scoreMin: scoreMinStr !== "" ? Number(scoreMinStr) : null,
      scoreMax: scoreMaxStr !== "" ? Number(scoreMaxStr) : null,
      sessionTime,
      lessonLocation: this.cmi["cmi.core.lesson_location"] || null,
      suspendData: this.cmi["cmi.suspend_data"] || null,
      cmiJson: JSON.stringify(this.cmi),
      finish,
    };
  }

  LMSInitialize(_arg: string): string {
    if (this.initialized) {
      this.lastError = ERROR_GENERAL;
      return SCORM_FALSE;
    }
    this.initialized = true;
    this.finished = false;
    this.lastError = ERROR_NONE;
    this.sessionStart = Date.now();
    return SCORM_TRUE;
  }

  LMSFinish(_arg: string): string {
    if (!this.initialized) {
      this.lastError = ERROR_NOT_INITIALIZED;
      return SCORM_FALSE;
    }
    if (this.finished) {
      return SCORM_TRUE;
    }
    this.finished = true;
    this.lastError = ERROR_NONE;
    this.onCommit(this.buildUpdate(true));
    return SCORM_TRUE;
  }

  LMSGetValue(element: string): string {
    if (!this.initialized) {
      this.lastError = ERROR_NOT_INITIALIZED;
      return "";
    }
    this.lastError = ERROR_NONE;
    const value = this.cmi[element];
    if (value !== undefined) {
      return value;
    }
    // Handle dynamic objectives/interactions
    if (/^cmi\.(objectives|interactions)\.\d+/.test(element)) {
      return "";
    }
    this.lastError = ERROR_ELEMENT_NOT_IMPLEMENTED;
    return "";
  }

  LMSSetValue(element: string, value: string): string {
    if (!this.initialized) {
      this.lastError = ERROR_NOT_INITIALIZED;
      return SCORM_FALSE;
    }

    const readOnly = [
      "cmi.core.student_id",
      "cmi.core.student_name",
      "cmi.core.credit",
      "cmi.core.entry",
      "cmi.core.total_time",
      "cmi.core._children",
      "cmi.core.score._children",
    ];

    if (readOnly.includes(element)) {
      this.lastError = "403";
      return SCORM_FALSE;
    }

    // Special handling for _count (read-only counters)
    if (element.endsWith("._count")) {
      this.lastError = ERROR_ELEMENT_CANNOT_HAVE_CHILDREN;
      return SCORM_FALSE;
    }

    this.lastError = ERROR_NONE;
    this.cmi[element] = value == null ? "" : String(value);
    return SCORM_TRUE;
  }

  LMSCommit(_arg: string): string {
    if (!this.initialized) {
      this.lastError = ERROR_NOT_INITIALIZED;
      return SCORM_FALSE;
    }
    this.lastError = ERROR_NONE;
    this.onCommit(this.buildUpdate(false));
    return SCORM_TRUE;
  }

  LMSGetLastError(): string {
    return this.lastError;
  }

  LMSGetErrorString(errorCode: string): string {
    return ERROR_STRINGS[errorCode] ?? "Unknown error";
  }

  LMSGetDiagnostic(errorCode: string): string {
    return this.LMSGetErrorString(errorCode);
  }

  /** Install this instance as window.API (SCORM 1.2 spec) */
  install(): void {
    (window as unknown as Record<string, unknown>).API = this;
  }

  /** Remove window.API */
  uninstall(): void {
    const w = window as unknown as Record<string, unknown>;
    if (w.API === this) {
      delete w.API;
    }
  }
}
