/* ============================================================================
 * 长征主题 changzheng V1 —— Host 半区（图标资源服务）
 * ----------------------------------------------------------------------------
 * 部署方式：本文件内容整体作为 cordis_define 的 code.host 参数传入。
 * 本文件是一个纯 JS 函数体（返回 Cordis Plugin 对象），不能独立运行。
 *
 * 职责：
 *   1. 按白名单读取 assets/ 目录下的 PNG（相对工作区优先，其次历史目录）。
 *   2. 手工字节级 Base64 编码为 data URL（不依赖 btoa 的 UTF-8 语义）。
 *   3. 通过 package 私有 RPC（handle 'icon'）提供给 Client 渲染。
 *
 * 依赖：Host 侧的 fs 服务（dsh-fs 能力）。
 * ========================================================================== */
return {
  apply(ctx) {
    const fs = ctx.get('fs')
    // 图标白名单：name -> assets 目录下的文件名
    const ICON_FILES = {
      logo: 'logo.png',
      serve: 'serve-the-people.png',
      star: 'star.png',
      write: 'write.png',
      settings: 'settings.png',
      complete: 'complete.png',
      read: 'read.png',
      error: 'error.png',
      thinking: 'thinking.png',
      redo: 'redo.png',
      fork: '新分支.png',
      sparkle: 'new.png',
    }
    const cache = new Map()
    // 手工 Base64：字节级还原，不受 btoa 的 UTF-8 文本语义影响
    const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    function toBase64(bytes) {
      let out = ''
      for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i]
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : -1
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : -1
        out += BASE64[b0 >> 2]
        out += BASE64[((b0 & 3) << 4) | (b1 === -1 ? 0 : (b1 >> 4))]
        out += b1 === -1 ? '=' : BASE64[((b1 & 15) << 2) | (b2 === -1 ? 0 : (b2 >> 6))]
        out += b2 === -1 ? '=' : BASE64[b2 & 63]
      }
      return out
    }
    ctx.effect(() => harness.handle('icon', async function (args) {
      const name = (args !== null && typeof args === 'object') ? args.name : undefined
      const file = typeof name === 'string' ? ICON_FILES[name] : undefined
      if (file === undefined || fs === undefined) return null
      const hit = cache.get(name)
      if (hit !== undefined) return hit
      // 相对路径按会话工作区根解析：'changzheng V1/assets' 与 'main-changzheng' 均可用；
      // 最后回退到开发机的绝对路径。
      for (const base of ['changzheng V1\\assets', 'main-changzheng', 'D:\\dsh0\\main-changzheng']) {
        try {
          const target = await fs.resolve(base + '\\' + file)
          const bytes = await fs.readBytes(target, undefined, 8 * 1024 * 1024)
          const url = 'data:image/png;base64,' + toBase64(bytes)
          cache.set(name, url)
          return url
        } catch (error) {
          // 该基准路径不可读，尝试下一个
        }
      }
      return null
    }), 'changzheng: icon rpc')
  },
}
