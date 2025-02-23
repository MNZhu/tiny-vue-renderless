import { xss } from '@opentiny/vue-renderless/common/xss.js'
import browser from '@opentiny/vue-renderless/common/browser'
import { toTreeArray } from '../static'
import { getCellValue, getFuncText } from '../utils'
import { exportExcel } from './exportExcel'

const getCsvLabelData = (columns, oData, tableElem) => {
  const trElemList = tableElem.querySelectorAll('.tiny-grid__body-wrapper.body__wrapper .tiny-grid-body__row')

  const trData = []

  for (let i = 0, len = trElemList.length; i < len; i++) {
    const item = {}
    const trElem = trElemList[i]

    columns.forEach((column) => {
      const cell = trElem.querySelector(`.${column.id}`)
      item[column.id] = cell ? cell.innerText.trim() : ''
    })

    trData.push(item)
  }

  return trData
}

const getCsvData = (opts, oData, oColumns, tableElem) => {
  const isOriginal = opts.original
  let columns = opts.columns ? opts.columns : oColumns

  if (opts.columnFilterMethod) {
    columns = columns.filter(opts.columnFilterMethod)
  }

  let datas = opts.data ? opts.data : isOriginal ? oData : getCsvLabelData(columns, oData, tableElem)

  if (opts.dataFilterMethod) {
    datas = datas.filter(opts.dataFilterMethod)
  }

  return { columns, datas }
}

const getCsvContent = ($table, opts, oColumns, oData) => {
  const isOriginal = opts.original
  const tableEl = $table.$el
  const tab = opts.useTabs === false ? '' : '\t'
  const { columns, datas } = getCsvData(opts, oData, oColumns, tableEl)
  let content = datas.length ? '\ufeff' : ''
  const transfrom = (str) => {
    if (typeof str === 'string' && str.replace(/ /g, '').match(/[\s,"]/)) {
      str = '"' + str.replace(/"/g, '""') + '"'
    }

    return str + tab
  }

  if (opts.isHeader) {
    content += columns.map(({ own }) => transfrom(getFuncText(own.title || own.label))).join(',') + '\n'
  }

  datas.forEach((row, rowIndex) => {
    if (isOriginal) {
      content +=
        columns
          .map((column) => {
            if (column.type === 'index') {
              return column.indexMethod ? column.indexMethod(rowIndex) : rowIndex + 1
            }

            return transfrom(getCellValue(row, column))
          })
          .join(',') + '\n'
    } else {
      content += columns.map((column) => transfrom(row[column.id])).join(',') + '\n'
    }
  })

  if (opts.isFooter) {
    const footerData = $table.footerData
    const footers = opts.footerFilterMethod ? footerData.filter(opts.footerFilterMethod) : footerData
    const filterMaps = $table.tableColumn.map((column) => ~columns.indexOf(column))

    footers.forEach((rows) => {
      content += rows.filter((val, colIndex) => filterMaps[colIndex]).join(',') + '\n'
    })
  }

  return content
}

const getCsvUrl = (opts, content) => {
  if (window.Blob && window.URL && window.URL.createObjectURL && browser.name !== 'safari') {
    return URL.createObjectURL(new Blob([content], { type: 'text/csv' }))
  }

  return `data:attachment/csv;charset=utf-8,${encodeURIComponent(content)}`
}

const downloadCsc = (options, content) => {
  if (!options.download) {
    return Promise.resolve(content)
  }

  if (navigator.msSaveBlob && window.Blob) {
    navigator.msSaveBlob(new Blob([content], { type: 'text/csv;charset=utf-8' }), options.filename)
  } else if (browser.name === 'ie') {
    const win = window.top.open('about:blank', '_blank')

    win.opener = null
    win.document.charset = 'utf-8'
    win.document.write(content)
    win.document.close()
    win.document.execCommand('SaveAs', options.filename)
    win.close()
  } else {
    const linkElem = document.createElement('a')

    linkElem.target = '_blank'
    linkElem.rel = 'noopener noreferrer'
    linkElem.download = options.filename
    linkElem.href = xss.filterUrl(getCsvUrl(options, content))
    document.body.appendChild(linkElem)
    linkElem.click()
    document.body.removeChild(linkElem)
  }
}

/**
 * 导出 csv 文件
 * 如果是启用了可视渲染，则只能导出数据源，可以配合 dataFilterMethod 函数自行转换数据
 * 如果是树表格，则默认是导出所有节点
 */
export default {
  _exportCsv(options) {
    let { visibleColumn, scrollXLoad, scrollYLoad, treeConfig } = this

    let mergedOpts = {
      columns: null,
      columnFilterMethod: (column) => column.property && ['index', 'selection', 'radio'].indexOf(column.type) === -1,
      download: true,
      data: null,
      dataFilterMethod: null,
      filename: 'table.csv',
      footerFilterMethod: null,
      isHeader: true,
      isFooter: true,
      original: !!treeConfig,
      ...options
    }

    if (mergedOpts.filename.indexOf('.csv') === -1) {
      mergedOpts.filename += '.csv'
    }

    if (!mergedOpts.original) {
      if (scrollXLoad || scrollYLoad) {
        mergedOpts.original = true
      }
    }

    let columns = visibleColumn
    let oData = this.tableFullData

    if (treeConfig) {
      oData = toTreeArray(oData, treeConfig)
    }

    oData.forEach((value) => {
      Object.keys(value).forEach((key) => {
        if (value[key] === 0) {
          value[key] = '0'
        }
      })
    })

    return downloadCsc(mergedOpts, getCsvContent(this, mergedOpts, columns, oData))
  },
  _exportExcel(options) {
    exportExcel(this, options)
  }
}
