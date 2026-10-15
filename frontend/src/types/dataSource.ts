export type SourceType = 'pharmacy_sales' | 'clinic_records' | 'lab_reports' | 'public_health_feed';
export type SourceStatus = 'active' | 'degraded' | 'syncing' | 'offline';

export interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  lastSync: string;
  recordsToday: number;
  dataCompleteness: number; // percentage
  latencyMinutes: number;
  authorizedOrganization: string;
  encryptionStatus: 'AES-256' | 'In-Transit TLS 1.3';
}

export interface CsvRowValidation {
  rowNumber: number;
  status: 'valid' | 'warning' | 'invalid';
  errors: string[];
  data: Record<string, any>;
}

export interface CsvValidationSummary {
  fileName: string;
  fileSizeBytes: number;
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  duplicateRows: number;
  detectedColumns: string[];
  requiredColumnsMissing: string[];
  rows: CsvRowValidation[];
}
