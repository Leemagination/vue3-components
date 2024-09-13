import {
  computed,
  defineComponent,
  ExtractPropTypes,
  h,
  PropType,
  ref,
  SetupContext,
  watch
} from 'vue';
import style from './calendarPicker.scss';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import DateText from './DateText';
import { calendarPickerEmits, CalendarPickerEmitsType } from './interface';

const dayList = ['一', '二', '三', '四', '五', '六', '日'];

const preMonthIcon = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.2674 15.793C11.9675 16.0787 11.4927 16.0672 11.2071 15.7673L6.20572 10.5168C5.9298 10.2271 5.9298 9.7719 6.20572 9.48223L11.2071 4.23177C11.4927 3.93184 11.9675 3.92031 12.2674 4.206C12.5673 4.49169 12.5789 4.96642 12.2932 5.26634L7.78458 9.99952L12.2932 14.7327C12.5789 15.0326 12.5673 15.5074 12.2674 15.793Z"
      fill="currentColor"
    ></path>
  </svg>
);

const nextMonthIcon = (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.73271 4.20694C8.03263 3.92125 8.50737 3.93279 8.79306 4.23271L13.7944 9.48318C14.0703 9.77285 14.0703 10.2281 13.7944 10.5178L8.79306 15.7682C8.50737 16.0681 8.03263 16.0797 7.73271 15.794C7.43279 15.5083 7.42125 15.0336 7.70694 14.7336L12.2155 10.0005L7.70694 5.26729C7.42125 4.96737 7.43279 4.49264 7.73271 4.20694Z"
      fill="currentColor"
    ></path>
  </svg>
);

const preYearIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M0 0h24v24H0V0z" fill="none"></path>
    <path
      fill="currentColor"
      d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"
    ></path>
  </svg>
);

const nextYearIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="transform: scaleX(-1)">
    <path d="M0 0h24v24H0V0z" fill="none"></path>
    <path
      fill="currentColor"
      d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"
    ></path>
  </svg>
);

/* 根据月份生成日历数组 */
function createCalendarList(date: Dayjs): Dayjs[] {
  const weekIndex = date.day();
  const monthDays = date.daysInMonth();

  const preMonthLen = (weekIndex + 6) % 7;
  const preMonthList: Dayjs[] = Array.from({ length: preMonthLen }).map((_, index) => {
    return date.add(index - preMonthLen, 'day');
  });
  const currentMonthList: Dayjs[] = Array.from({ length: monthDays }, (_, index) => {
    return date.add(index, 'day');
  });
  const nextMonthLen = (preMonthList.length + currentMonthList.length) % 7;
  const nextMonth = date.add(1, 'month');
  const nextMonthList: Dayjs[] = Array.from({ length: (7 - nextMonthLen) % 7 }).map((_, index) => {
    return nextMonth.add(index, 'day');
  });
  return [...preMonthList, ...currentMonthList, ...nextMonthList];
}

const calendarProps = {
  timestamp: {
    type: Number as PropType<number | null>,
    default: null
  }
};

const setup = (
  props: ExtractPropTypes<typeof calendarProps>,
  context: SetupContext<Array<CalendarPickerEmitsType>>
) => {
  const realityDate = dayjs(props.timestamp ?? undefined).startOf('month');
  const currentDate = ref(realityDate);
  const activeDate = computed(() => {
    return props.timestamp ? dayjs(props.timestamp) : null;
  });

  const calendarRowList = computed(() => {
    const calendarList = createCalendarList(currentDate.value);
    const result = [];
    const sliceNum = 7;
    for (let i = 0; i < calendarList.length; i = i + sliceNum) {
      result.push(
        calendarList.slice(i, i + sliceNum).map((item) => {
          return {
            value: item,
            timestamp: item.valueOf(),
            isCurrentMonth: currentDate.value.isSame(item.startOf('month')),
            isActive: activeDate.value ? activeDate.value.isSame(item, 'day') : false
          };
        })
      );
    }
    return result;
  });

  function changeMonth(type: 'pre' | 'next') {
    currentDate.value = currentDate.value.add(type === 'pre' ? -1 : 1, 'month');
  }

  function changeYear(type: 'pre' | 'next') {
    currentDate.value = currentDate.value.add(type === 'pre' ? -1 : 1, 'year');
  }

  function handleDateClick(item: Dayjs) {
    context.emit('dateClick', item);
  }

  function handleYearClick(val: number) {
    currentDate.value = currentDate.value.set('year', val);
  }

  function handleMonthClick(val: number) {
    currentDate.value = currentDate.value.set('month', val);
  }

  return {
    currentDate,
    calendarRowList,
    changeMonth,
    changeYear,
    handleDateClick,
    handleYearClick,
    handleMonthClick
  };
};

const CalendarPicker = defineComponent({
  __STYLE__: style,
  props: calendarProps,
  emits: calendarPickerEmits,
  setup,
  render() {
    return (
      <div class="lee-calendar-picker">
        <div class="lee-calendar-picker-header">
          <div
            onClick={() => {
              this.changeYear('pre');
            }}
            class="lee-calendar-picker-header__button"
          >
            {preYearIcon}
          </div>
          <div
            onClick={() => {
              this.changeMonth('pre');
            }}
            class="lee-calendar-picker-header__button"
          >
            {preMonthIcon}
          </div>
          <DateText
            onYearClick={this.handleYearClick}
            onMonthClick={this.handleMonthClick}
            currentDate={this.currentDate}
          ></DateText>
          <div
            onClick={() => {
              this.changeMonth('next');
            }}
            class="lee-calendar-picker-header__button"
          >
            {nextMonthIcon}
          </div>
          <div
            onClick={() => {
              this.changeYear('next');
            }}
            class="lee-calendar-picker-header__button"
          >
            {nextYearIcon}
          </div>
        </div>
        <div class="lee-calendar-picker-row lee-calendar-picker-day-row">
          {dayList.map((day) => {
            return (
              <div class="lee-calendar-picker-item">
                <div class="lee-calendar-picker-cell">{day}</div>
              </div>
            );
          })}
        </div>
        {this.calendarRowList.map((row) => {
          return (
            <div class="lee-calendar-picker-row">
              {row.map((item) => {
                return (
                  <div
                    onClick={() => this.handleDateClick(item.value)}
                    class={[
                      'lee-calendar-picker-item',
                      item.isCurrentMonth ? 'lee-calendar-picker-item__current-month' : null,
                      item.isActive ? 'lee-calendar-picker-item__active-date' : null
                    ]}
                  >
                    <div class="lee-calendar-picker-cell">
                      <div class="lee-calendar-picker-item__info-date">
                        {item.value.format('DD')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
});
export default CalendarPicker;
