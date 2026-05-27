export type MonthKey = string;

export type MonthStatus = "missing" | "parsing" | "covered" | "failed";

export interface MonthCell {
  key: MonthKey;
  label: string;
  year: number;
  monthIndex: number;
  status: MonthStatus;
}

export type UploadState = "parsing" | "complete" | "failed";

export interface ExtractedData {
  periodLabel: string;
  transactions: number;
  accountName: string;
  accountType: string;
  accountTail: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  sizeKb: number;
  assignedMonthKeys: MonthKey[];
  spanMonths: number;
  startedAt: number;
  state: UploadState;
  willFail?: boolean;
  failureReason?: string;
  extracted?: ExtractedData;
}

export interface UploadOptions {
  span?: number;
  fail?: boolean;
}

export type ConnectionState = "connecting" | "connected" | "failed";

export interface BankFixture {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface BankConnection {
  id: string;
  bank: BankFixture;
  accountName: string;
  accountType: string;
  accountTail: string;
  assignedMonthKeys: MonthKey[];
  spanMonths: number;
  startedAt: number;
  state: ConnectionState;
  willFail?: boolean;
  failureReason?: string;
  transactions?: number;
  periodLabel?: string;
}

export interface ConnectOptions {
  fail?: boolean;
}
