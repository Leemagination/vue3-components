import { computed, defineComponent, ExtractPropTypes, h, ref, SetupContext } from 'vue';
import './calendar.scss';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const dayList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

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

const calendarProps = {};

const setup = (
  props: ExtractPropTypes<typeof calendarProps>,
  context: SetupContext<['date-click']>
) => {
  const realityDate = dayjs().startOf('month');
  const currentDate = ref(realityDate);
  const activeDate = ref(dayjs().startOf('day'));

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
            isActive: activeDate.value.isSame(item)
          };
        })
      );
    }
    return result;
  });

  function changeMonth(type: 'pre' | 'next') {
    currentDate.value = currentDate.value.add(type === 'pre' ? -1 : 1, 'month');
  }

  function handleDateClick(item: Dayjs) {
    activeDate.value = item;
    context.emit('date-click', item);
  }

  return {
    currentDate,
    calendarRowList,
    changeMonth,
    handleDateClick
  };
};

const Calendar = defineComponent({
  setup,
  render() {
    return (
      <div class="lee-calendar">
        <div class="lee-calendar-header">
          <div
            onClick={() => {
              this.changeMonth('pre');
            }}
            class="lee-calendar-header__button"
          >
            上一月
          </div>
          <span class="lee-calendar-header__current-date">
            {this.currentDate.format('YYYY年 MM月')}
          </span>
          <div
            onClick={() => {
              this.changeMonth('next');
            }}
            class="lee-calendar-header__button"
          >
            下一月
          </div>
        </div>
        <div class="lee-calendar-row lee-calendar-day-row">
          {dayList.map((day) => {
            return (
              <div class="lee-calendar-item">
                <div class="lee-calendar-cell">{day}</div>
              </div>
            );
          })}
        </div>
        {this.calendarRowList.map((row) => {
          return (
            <div class="lee-calendar-row">
              {row.map((item) => {
                return (
                  <div
                    onClick={() => this.handleDateClick(item.value)}
                    class={[
                      'lee-calendar-item',
                      item.isCurrentMonth ? 'lee-calendar-item__current-month' : null,
                      item.isActive ? 'lee-calendar-item__active-date' : null
                    ]}
                  >
                    <div class="lee-calendar-cell">
                      <div class="lee-calendar-item__info-month">{item.value.format('MM月')}</div>
                      <div class="lee-calendar-item__info-date">{item.value.format('DD')}</div>
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
export default Calendar;
