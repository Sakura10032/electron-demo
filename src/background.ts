import {app, BrowserWindow} from 'electron'
import * as process from "process";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true, // 可以在渲染进程中使用 node 的 api 为了安全默认是 false
      contextIsolation: false,
      webSecurity:false, // 关闭跨域检测
    }
  })

  // win.webContents.openDevTools()

  if (process.argv[2]) {
    // 开发环境
    win.loadURL(process.argv[2]).then(() => {} )
  }else {
    // 生产环境
    win.loadFile('index.html').then(() => {} )
  }

})
