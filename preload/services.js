const fs = require('node:fs')
const path = require('node:path')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 读文件
  readFile(file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile(text, fileName = null) {
    const timestamp = Date.now()
    const defaultFileName = fileName || `prompt-export-${timestamp}.json`
    const filePath = path.join(window.utools.getPath('downloads'), defaultFileName)
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile(base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  // 确保目录存在
  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    return dirPath
  },
  // 获取插件数据目录
  getPluginDataPath() {
    return window.utools.getPath('userData')
  },
  // 检查文件是否存在
  fileExists(filePath) {
    return fs.existsSync(filePath)
  }
}
