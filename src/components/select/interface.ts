export type SelectType = 'focus' | 'blur' | 'change' | 'update:value';

export type SelectOptionType = {
  text: string;
  value: number | string;
};

export type FormatOptionType = {
  selected: boolean;
} & SelectOptionType;
