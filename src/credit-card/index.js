export const cardType = (number) => {
  if (/^4/.test(number)) {
    return 'visa'
  }

  if (/^(34|37)/.test(number)) {
    return 'amex'
  }

  if (/^5[1-5]/.test(number)) {
    return 'mastercard'
  }

  if (/^6011/.test(number)) {
    return 'discover'
  }

  if (/^62/.test(number)) {
    return 'unionpay'
  }

  if (/^9792/.test(number)) {
    return 'troy'
  }

  if (/^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}/.test(number)) {
    return 'dinersclub'
  }

  if (/^35(2[89]|[3-8])/.test(number)) {
    return 'jcb'
  }

  return ''
}

export const changeFocus = ({ refs, state }) => () => {
  let target = refs[state.currentFocus]

  if (target) {
    const transform = `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`

    state.focusElementStyle = {
      transform,
      width: `${target.offsetWidth}px`,
      height: `${target.offsetHeight}px`
    }
  } else {
    state.focusElementStyle = null
  }
}

export const getIsNumberMasked = (props) => (index, n) =>
  index > 4 && index < 14 && props.labels.cardNumber.length > index && n.trim() !== '' && props.isCardNumberMasked

export const changePlaceholder = ({ api, nextTick, state }) => () => {
  if (state.cardType === 'amex') {
    state.currentPlaceholder = state.amexCardPlaceholder
  } else if (state.cardType === 'dinersclub') {
    state.currentPlaceholder = state.dinersCardPlaceholder
  } else {
    state.currentPlaceholder = state.defaultCardPlaceholder
  }

  nextTick(() => {
    api.changeFocus()
  })
}

export const focus = ({ props, state }) => (event) => {
  const element = event.target

  state.isFocused = true

  if (element.id === props.fields.cardYear || element.id === props.fields.cardMonth) {
    state.currentFocus = 'cardDate'
  } else {
    state.currentFocus = element.id
  }

  state.isCardFlipped = element.id === props.fields.cardCvv
}

export const blur = ({ props, state }) => (event) => {
  const element = event.target

  state.isCardFlipped = !element.id === props.fields.cardCvv

  setTimeout(() => {
    if (!state.isFocused) {
      state.currentFocus = null
    }
  }, 300)

  state.isFocused = false
}

export const toggleEvent = ({ api, fieldsEls, type }) => {
  if (fieldsEls) {
    for (let i = 0; i < fieldsEls.length; i++) {
      const element = fieldsEls[i]
      const eventType = `${type}EventListener`

      element[eventType]('focus', api.focus)
      element[eventType]('blur', api.blur)
    }
  }
}
