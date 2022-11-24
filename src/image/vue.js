import {
  computedGetImageStyle,
  computedGetAlignCenter,
  computedGetPreview,
  loadImage,
  handleLoad,
  handleError,
  handleLazyLoad,
  addLazyLoadListener,
  removeLazyLoadListener,
  getImageStyle,
  clickHandler,
  closeViewer,
  mounted
} from './index'

export const api = [
  'state',
  'src',
  'zIndex',
  'previewSrcList',
  'loadImage',
  'clickHandler',
  'closeViewer',
  'handleLoad',
  'handleError'
]

const initState = ({ reactive, computed, api, props }) => {
  const state = reactive({
    error: false,
    loading: true,
    imageWidth: 0,
    imageHeight: 0,
    show: !props.lazy,
    showViewer: false,
    getPreview: computed(() => api.computedGetPreview()),
    getImageStyle: computed(() => api.computedGetImageStyle()),
    getAlignCenter: computed(() => api.computedGetAlignCenter())
  })

  return state
}

const initApi = ({ api, state, emit, props, vm, constants, nextTick, attrs }) => {
  Object.assign(api, {
    state,
    closeViewer: closeViewer(state),
    clickHandler: clickHandler(state),
    handleLoad: handleLoad({ state, emit }),
    handleError: handleError({ state, emit }),
    computedGetPreview: computedGetPreview(props),
    removeLazyLoadListener: removeLazyLoadListener(state),
    getImageStyle: getImageStyle({ state, vm, constants }),
    computedGetAlignCenter: computedGetAlignCenter({ props, constants }),
    mounted: mounted({ api, props }),
    handleLazyLoad: handleLazyLoad({ api, state, vm, nextTick }),
    loadImage: loadImage({ api, state, props, attrs }),
    computedGetImageStyle: computedGetImageStyle({ api, props }),
    addLazyLoadListener: addLazyLoadListener({ api, props, state, vm })
  })
}

const initWatch = ({ watch, state, api, props }) => {
  watch(
    () => props.src,
    (value, oldValue) => value !== oldValue && state.show && api.loadImage()
  )

  watch(
    () => state.show,
    (value) => value && api.loadImage()
  )
}

export const renderless = (
  props,
  { computed, onBeforeUnmount, onMounted, reactive, watch },
  { vm, emit, constants, nextTick, attrs }
) => {
  const api = {}
  const state = initState({ reactive, computed, api, props })

  initApi({ api, state, emit, props, vm, constants, nextTick, attrs })

  initWatch({ watch, state, api, props })

  onMounted(api.mounted)
  onBeforeUnmount(() => props.lazy && api.removeLazyLoadListener())

  return api
}
