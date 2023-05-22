export type ProgressType = 'line' | 'circle';
export const progressType: ProgressType[] = ['line', 'circle'];
export interface ColorConfig {
  from?: string;
  to?: string;
  normal: string;
  success: string;
  error: string;
  warning: string;
}
export type ProgressStatus = undefined | 'normal' | 'success' | 'error' | 'warning';
