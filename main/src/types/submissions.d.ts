export type SubmissionStatus = "QU" | "AC" | "WA" | "TL" | "RT" | "CE";

interface SubmissionResult {
  verdict: SubmissionStatus;
  execution_time: number;
  log?: string;
}