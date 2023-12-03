import type {Plugin} from 'vite'
import fs from 'node:fs'
import * as electronBuilder from 'electron-builder'
import path from 'path'

/**
 * 因为 electron 不认识 ts 需要将 ts 转成 js
 */
const buildBackground = () => {
  require('esbuild').buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  })
}

// 打包需要先等 vite 打完包之后就会 index.html 再执行 electron-builder 打包
export const ElectronBuildPlugin = (): Plugin => {
  return {
    name: 'electron-build',
    closeBundle () {
      buildBackground()
      // electron-builder 需要指定 package.json main
      const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      json.main = 'background.js'
      fs.writeFileSync('dist/package.json', JSON.stringify(json, null, 4))
      // 防止 electron-builder 下载垃圾文件,关键还下载不下来
      fs.mkdirSync('dist/node_modules')

      electronBuilder.build({
        config: {
          directories: {
            output: path.resolve(process.cwd(), 'release'),
            app: path.resolve(process.cwd(), 'dist')
          },
          asar: true, // 压缩包
          appId: 'com.electron.app',
          productName: 'vite-app-electron',
          nsis: {
            oneClick: false, // 取消一键安装,
            allowToChangeInstallationDirectory: true, // 允许用户选择安装目录
          }
        }
      }).then(() => {
      })
    }
  }
}
