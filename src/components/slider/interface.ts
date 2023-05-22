import { Slot } from 'vue';

export type StepSlot = {
  order: number;
  slot: Slot;
};

export type ValidSlots = JSX.Element | null;
