import { parsePercentage, handleClick, picturefilePreview, getDeleteData, downloadFile } from './index'
import { downloadFile as edmDownloadFile, getToken } from '@opentiny/vue-renderless/file-upload'

export const api = ['t', 'state', 'parsePercentage', 'handleClick', 'handlePreview', 'picturefilePreview', 'getDeleteData', 'downloadFile']

export const renderless = (props, { reactive }, { t, parent, mode: tinyMode, emit, service }, { Modal }) => {
  const mode = props._mode || parent.$mode || (tinyMode ? (tinyMode.value ? tinyMode.value : 'pc') : 'pc')

  const state = reactive({
    focusing: false,
    shows: false,
    startPostion: 0,
    screenType: mode === 'pc' ? false : true
  })

  parent.getToken = getToken({
    constants: parent.$constants,
    props: parent,
    state: parent.state,
    t,
    Modal
  })

  const api = {
    state,
    getDeleteData: getDeleteData(emit),
    parsePercentage: parsePercentage(),
    downloadFile: downloadFile(service),
    picturefilePreview: picturefilePreview(state),
    edmDownloadFile: edmDownloadFile({
      api: parent,
      constants: parent.$constants,
      props: parent,
      service,
      state: parent.state
    })
  }

  Object.assign(api, {
    handleClick: handleClick({ props, api, parent })
  })

  return api
}
