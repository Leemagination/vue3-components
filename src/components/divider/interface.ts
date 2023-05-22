export type DividerDirection = 'horizontal' | 'vertical';
export const dividerDirection: DividerDirection[] = ['horizontal', 'vertical'];

export type LineAlign = 'center' | 'left' | 'right';
export const dividerLineAlign: LineAlign[] = ['center', 'left', 'right'];

export interface DivideLineStyle {
  width?: string;
  height?: string;
  background?: string;
  lineHeight?: string;
}

type JustifyContent = 'center' | 'flex-start' | 'flex-end';

export const lineAlignMap: { [p: string]: JustifyContent } = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end'
};
export interface DivideDividerStyle {
  justifyContent?: JustifyContent;
}

export type FlexLineStyle =
  | {
      flex: number;
      height: string;
      display?: never;
    }
  | {
      flex?: never;
      height: string;
      display: 'none';
    };
