import scrollIntoView from '@opentiny/vue-renderless/common/deps/scroll-into-view'
import { DATEPICKER } from '@opentiny/vue-renderless/common'

export const parseTime = () => (time) => {
  const values = (time || '').split(':')

  if (values.length >= 2) {
    const hours = parseInt(values[0], 10)
    const minutes = parseInt(values[1], 10)

    return {
      hours,
      minutes
    }
  }
  /* istanbul ignore next */
  return null
}

export const compareTime = (api) => (time1, time2) => {
  const value1 = api.parseTime(time1)
  const value2 = api.parseTime(time2)
  const minutes1 = value1.minutes + value1.hours * 60
  const minutes2 = value2.minutes + value2.hours * 60

  if (minutes1 === minutes2) {
    return 0
  }

  return minutes1 > minutes2 ? 1 : -1
}

export const formatTime = () => (time) =>
  (time.hours < 10 ? '0' + time.hours : time.hours) + ':' + (time.minutes < 10 ? '0' + time.minutes : time.minutes)

export const nextTime = (api) => (time, step) => {
  const timeValue = api.parseTime(time)
  const stepValue = api.parseTime(step)
  const next = {
    hours: timeValue.hours,
    minutes: timeValue.minutes
  }

  next.minutes += stepValue.minutes
  next.hours += stepValue.hours
  next.hours += Math.floor(next.minutes / 60)
  next.minutes = next.minutes % 60

  return api.formatTime(next)
}

export const emitDestroy = (emit) => () => emit('dodestroy')

export const emitPick = ({ emit, state }) => ({ value = null, visible = false } = {}) => {
  const lastEmitValue = JSON.stringify({ value, visible })

  if (!state.lastEmitValue || state.lastEmitValue !== lastEmitValue) {
    state.lastEmitValue = lastEmitValue
    emit('pick', value, visible)
  }
}

export const watchValue = ({ api, nextTick }) => (value) => {
  if (!value) {
    return
  }

  nextTick(() => api.scrollToOption())
}

export const computItems = ({ api, state }) => () => {
  const start = state.start
  const end = state.end
  const step = state.step
  const result = []

  if (start && end && step) {
    let current = start

    while (api.compareTime(current, end) <= 0) {
      result.push({
        value: current,
        disabled:
          api.compareTime(current, state.minTime || DATEPICKER.CompareOne) <= 0 ||
          api.compareTime(current, state.maxTime || DATEPICKER.CompareHundred) >= 0
      })

      current = api.nextTime(current, step)
    }
  }

  return result
}

export const handleClick = (api) => (item) => !item.disabled && api.emitPick({ value: item.value })

export const handleClear = ({ api, state }) => () => {
  state.defaultValue = ''
  state.defaultTime = ''

  api.emitPick()
}

export const scrollToOption = ({ refs }) => (selector = DATEPICKER.selClass) => {
  const menu = refs.popper.querySelector(DATEPICKER.queryClass)
  scrollIntoView(menu, menu.querySelector(selector))
}

export const handleMenuEnter = ({ api, nextTick, state }) => () => {
  const selected = state.items.map((item) => item.value).indexOf(state.value) !== -1
  const hasDefault = state.items.map((item) => item.value).indexOf(state.default) !== -1
  const option = (selected && DATEPICKER.selClass) || (hasDefault && DATEPICKER.defaultClass) || DATEPICKER.disableClass

  nextTick(() => api.scrollToOption(option))
}

export const scrollDown = ({ api, state }) => (step) => {
  const items = state.items
  const length = items.length
  let total = items.length
  let index = items.map((item) => item.value).indexOf(state.value)

  while (total--) {
    index = (index + step + length) % length
    if (!items[index].disabled) {
      api.emitPick({ value: items[index].value, visible: true })
      return
    }
  }
}

export const isValidValue = (state) => (date) =>
  state.items
    .filter((item) => !item.disabled)
    .map((item) => item.value)
    .indexOf(date) !== -1

export const handleKeydown = ({ api }) => (event) => {
  const keyCode = event.keyCode

  if (keyCode === 38 || keyCode === 40) {
    const mapping = DATEPICKER.MappingKeyCode
    const offset = mapping[keyCode.toString()]

    api.scrollDown(offset)
    event.stopPropagation()
  }
}
