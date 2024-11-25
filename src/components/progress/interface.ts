export type ProgressType = 'line' | 'circle';
export const progressType: ProgressType[] = ['line', 'circle'];
export interface ColorConfig {
  normal: string;
  success: string;
  error: string;
  warning: string;
}
export type ProgressStatus = undefined | 'normal' | 'success' | 'error' | 'warning';
