import type {Plugin} from 'vite'
import {AddressInfo} from "net";
import {spawn} from "child_process";
import fs from 'node:fs'

const buildBackground = () =>{
  require('esbuild').buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  })
}

export const ElectronDevPlugin = (): Plugin => {
  return  {
    name: 'electron-dev',
    configureServer(server){
      buildBackground()
      server?.httpServer?.once('listening', () => {
        // 读取 vite 服务信息
        const  addressInfo = server.httpServer?.address() as AddressInfo
        // 拼接 IP 地址 给 electron 启动服务的时候用
        const IP = `http://localhost:${addressInfo.port}`
        // 第一个参数是 electron 的入口文件
        // require("electron")返回的是一个路径
        // electron 不认识 ts 文件需要编译成 js 文件
        // 进程传参发送给 electron IP
        let ElectronProcess = spawn(require("electron"), ['dist/background.js', IP])
        fs.watchFile('src/background.ts', () => {
          ElectronProcess.kill()
          buildBackground()
          ElectronProcess = spawn(require("electron"), ['dist/background.js', IP])
        })
        ElectronProcess.stderr.on('data',(data) => {
          console.log('日志---',data.toString())
        })
        console.log(IP)
      })
    }
  }
}
