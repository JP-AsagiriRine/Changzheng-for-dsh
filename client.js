/* ============================================================================
 * 长征主题 changzheng（V1.7 / 重建 pkg-3）—— Client 半区
 * ----------------------------------------------------------------------------
 * 部署方式：本文件内容整体作为 cordis_define 的 code.client 参数传入。
 * 本文件是一个纯 JS 函数体（返回 Cordis Plugin 对象），不能独立运行。
 *
 * V1.7 变更：
 *   1. 侧栏 logo 放大：112px → 132px（折叠栏 46px → 52px，logoRow 132px → 148px）。
 *   2. 下拉菜单/浮层统一主题：role=menu（分组/排序、打开方式等下拉）、role=listbox
 *      （模型选择浮层）、role=tooltip（提示气泡）与工作区悬浮卡（_hoverContent）
 *      统一为黑红直角卡片（黑底 + 红边 + 泛光），菜单项悬停暗红底。
 *
 * V1.6 变更：
 *   1. 显像管设置菜单：主开关旁新增 ▾ 箭头，菜单含「刷新速度」（1-10，滚纹扫描
 *      周期 --cz-roll-duration = 16 - 1.4*v 秒）与「信号干扰」开关 +「强度」
 *      （1-10，受开关门控）。
 *   2. 信号干扰改为 SVG 位移映射滤镜（#cz-interfere-distort：feTurbulence 扭曲场
 *      + feDisplacementMap，scale 由 0.8s 动画序列驱动，强度变化时重写序列），
 *      画面是扭曲/撕裂而非左右抖动。
 *   3. 门控选择器升级：body:is([data-ds-theme="changzheng"], [style*="--cz-changzheng-active"])
 *      —— 兼容新版 dsh（内置 changzheng，presenter 写 data-ds-theme）与旧版插件
 *      注册标记变量两种形态。
 *   4. 主题注册容错：新版 dsh 已内置 changzheng 主题时 register 报 already registered
 *      视为成功（颜色令牌由产品内置主题提供）；旧版冲突仍按 400ms 最多重试 5 次。
 *   5. 外观行：V1.6 不再注册 settings.general.item 的 appearance 行——新版 dsh 的
 *      「设置→常规→外观」已内置「长征」立方体。旧版 dsh（无内置行）请保留 V1.5。
 *
 * 向后兼容：类名规则依赖产品 CSS-module 类名（[hash]_[local] 模式）；若目标
 *   dsh 版本组件类名变化，对应 CSS 规则失效，但插槽功能与主题色不受影响。
 * ========================================================================== */
return {
  apply(ctx) {
    const theme = ctx.get('theme')
    const slots = ctx.get('slots')

    if (theme !== undefined) {
      // 注册主题（时序容错：更新时旧 fiber 注销可能尚未完成，register 抛“already registered”，稍后重试）
      ctx.effect(() => {
        let closed = false
        let themeDispose = null
        let attempts = 0
        const registerTheme = function () {
          if (closed) return
          try {
            themeDispose = theme.register({
              id: 'changzheng',
              colorScheme: 'dark',
              tokens: {
                '--dsw-alias-bg-base': '#0c0000',
                '--dsw-alias-bg-layer-1': '#160505',
                '--dsw-alias-bg-layer-2': '#1f0a0a',
                '--dsw-alias-bg-overlay': '#190707',
                '--dsw-alias-border-l1': '#2f1212',
                '--dsw-alias-border-l2': '#7a2020',
                '--dsw-alias-brand-primary': '#e60012',
                '--dsw-alias-label-primary': '#f6ecec',
                '--dsw-alias-label-secondary': '#c8a0a0',
                '--dsw-alias-state-error-primary': '#ff3131',
                '--dsw-alias-state-success-primary': '#4fbf4f',
                '--dsw-alias-state-warn-primary': '#e0b400',
                '--dsw-specific-sidebar-fill': '#110202',
                // 主题激活标记：仅当 changzheng 激活时由 presenter 内联到 body，用于门控全部样式
                '--cz-changzheng-active': '1',
              },
            })
          } catch (error) {
            // 新版 dsh 内置 changzheng：id 冲突即视为成功（令牌由产品内置主题提供）
            const message = String((error && error.message) || error)
            if (message.indexOf('already registered') >= 0) return
            if (attempts < 5) {
              attempts += 1
              const timer = ctx.get('timer')
              if (timer !== undefined) timer.timeout(registerTheme, 400)
            }
          }
        }
        registerTheme()
        return function () {
          closed = true
          if (themeDispose !== null) themeDispose()
        }
      }, 'changzheng: register theme')
    }

    if (slots === undefined) return

    const G = 'body:is([data-ds-theme="changzheng"], [style*="--cz-changzheng-active"])'

    const iconCache = new Map()
    const loadIcon = function (name) {
      return host.call('icon', { name: name }).then(function (url) {
        if (typeof url === 'string' && url !== '') {
          iconCache.set(name, url)
          return url
        }
        return null
      }).catch(function () { return null })
    }
    function useIcon(name) {
      const [src, setSrc] = React.useState(iconCache.get(name) || null)
      React.useEffect(() => {
        let alive = true
        if (iconCache.has(name)) {
          setSrc(iconCache.get(name))
          return
        }
        loadIcon(name).then(function (url) {
          if (alive && url !== null) setSrc(url)
        })
        return function () { alive = false }
      }, [name])
      return src
    }

    // 显像管设置：主开关 + 刷新速度 + 信号干扰（开关/强度），进程内状态
    const crtSettings = {
      value: { on: false, refresh: 5, interfere: false, strength: 4 },
      listeners: new Set(),
      getSnapshot: function () { return crtSettings.value },
      subscribe: function (fn) {
        crtSettings.listeners.add(fn)
        return function () { crtSettings.listeners.delete(fn) }
      },
      publish: function (next) {
        crtSettings.value = next
        crtSettings.listeners.forEach(function (fn) { fn() })
      },
      toggleCrt: function () { crtSettings.publish({ ...crtSettings.value, on: !crtSettings.value.on }) },
      setRefresh: function (v) { crtSettings.publish({ ...crtSettings.value, refresh: v }) },
      setInterfere: function (v) { crtSettings.publish({ ...crtSettings.value, interfere: v }) },
      setStrength: function (v) { crtSettings.publish({ ...crtSettings.value, strength: v }) },
    }
    const crtMenu = {
      value: false,
      listeners: new Set(),
      getSnapshot: function () { return crtMenu.value },
      subscribe: function (fn) {
        crtMenu.listeners.add(fn)
        return function () { crtMenu.listeners.delete(fn) }
      },
      publish: function (next) {
        crtMenu.value = next
        crtMenu.listeners.forEach(function (fn) { fn() })
      },
      toggle: function () { crtMenu.publish(!crtMenu.value) },
      set: function (v) { crtMenu.publish(v) },
    }
    const refreshDuration = function (v) { return (16 - 1.4 * v).toFixed(1) + 's' }
    const interferenceScaleValues = function (v) {
      return [0.4, 1.6, 0.6, 2.4, 0.3, 1.1, 0.5, 1.9, 0.4]
        .map(function (f) { return (f * v).toFixed(1) })
        .join(';')
    }

    const tips = {
      value: false,
      listeners: new Set(),
      getSnapshot: function () { return tips.value },
      subscribe: function (fn) {
        tips.listeners.add(fn)
        return function () { tips.listeners.delete(fn) }
      },
    }
    const setTips = function (v) {
      tips.value = v
      tips.listeners.forEach(function (fn) { fn() })
    }
    const toggleTips = function () { setTips(!tips.value) }

    // 信号干扰扭曲滤镜：注入 0x0 SVG（feTurbulence + feDisplacementMap），
    // 并把 CRT 设置投影到 body（--cz-roll-duration / data-cz-interfere / scale 序列）
    if (typeof document !== 'undefined') {
      ctx.effect(function () {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '0')
        svg.setAttribute('height', '0')
        svg.setAttribute('aria-hidden', 'true')
        svg.style.position = 'absolute'
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
        filter.setAttribute('id', 'cz-interfere-distort')
        const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
        turbulence.setAttribute('type', 'fractalNoise')
        turbulence.setAttribute('baseFrequency', '0.012 0.11')
        turbulence.setAttribute('numOctaves', '2')
        turbulence.setAttribute('seed', '11')
        turbulence.setAttribute('result', 'warp')
        const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
        displacement.setAttribute('in', 'SourceGraphic')
        displacement.setAttribute('in2', 'warp')
        displacement.setAttribute('xChannelSelector', 'R')
        displacement.setAttribute('yChannelSelector', 'G')
        const scale = document.createElementNS('http://www.w3.org/2000/svg', 'animate')
        scale.setAttribute('attributeName', 'scale')
        scale.setAttribute('dur', '0.8s')
        scale.setAttribute('repeatCount', 'indefinite')
        displacement.appendChild(scale)
        filter.appendChild(turbulence)
        filter.appendChild(displacement)
        svg.appendChild(filter)
        document.body.appendChild(svg)

        const applyCrt = function (settings) {
          document.body.style.setProperty('--cz-roll-duration', refreshDuration(settings.refresh))
          document.body.toggleAttribute('data-cz-interfere', settings.on && settings.interfere)
          scale.setAttribute('values', interferenceScaleValues(settings.strength))
        }
        applyCrt(crtSettings.getSnapshot())
        const off = crtSettings.subscribe(function () { applyCrt(crtSettings.getSnapshot()) })
        return function () {
          off()
          document.body.style.removeProperty('--cz-roll-duration')
          document.body.removeAttribute('data-cz-interfere')
          svg.remove()
        }
      }, 'changzheng: CRT filter/variables')
    }

    ctx.effect(() => styles.insert([
      // logo：居中 112px 直贴
      G + ' .cz-brand-mark { filter: drop-shadow(0 0 8px rgba(230, 0, 18, 0.6)); }',
      G + ' [class*=\\'_brand\\'] { background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; }',
      G + ' [class*=\\'_brand\\']:hover { background: transparent !important; }',
      G + ' [class*=\\'_brandIdentity\\'] { height: auto !important; }',
      G + ' [class$=\\'_logoRow\\'] { height: 148px !important; position: relative; }',
      G + ' [class*=\\'_collapsed\\'] [class$=\\'_logoRow\\'] { height: 60px !important; }',
      G + ' [class$=\\'_logoRow\\'] > [class*=\\'_brand\\'] { position: absolute !important; inset: 0 !important; width: 100% !important; display: inline-flex; align-items: center; justify-content: center; }',
      G + ' [class$=\\'_logoRow\\'] [class*=\\'_iconButton\\'] { position: relative !important; z-index: 2 !important; }',
      G + ' [class*=\\'_brandMark\\'] .cz-brand-wrap, ' + G + ' [class*=\\'_brandMark\\'] .cz-brand-img { width: 132px !important; height: 132px !important; }',
      G + ' [class$=\\'_railMark\\'] .cz-brand-wrap, ' + G + ' [class$=\\'_railMark\\'] .cz-brand-img { width: 52px !important; height: 52px !important; }',
      // 深度求索中... → 为人民服务中...
      G + ' [class$=\\'_turnStatus\\'] { font-size: 0 !important; }',
      G + ' [class$=\\'_turnStatus\\']::after { content: \\'为人民服务中...\\'; font-size: var(--dsh-content-font-size, 14px) !important; line-height: calc(22px + var(--dsh-content-font-delta, 0px)) !important; }',
      // 设置控件：红色 + 直角
      G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.85) !important; color: #fff !important; box-shadow: 0 0 12px rgba(230, 0, 18, 0.55) !important; }',
      G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'] * { color: #fff !important; }',
      // 全局直角
      G + ' button, ' + G + ' input, ' + G + ' textarea, ' + G + ' select, ' + G + ' [role=\\'menuitem\\'], ' + G + ' [role=\\'menu\\'], ' + G + ' [role=\\'option\\'], ' + G + ' [role=\\'listbox\\'], ' + G + ' [role=\\'tab\\'], ' + G + ' [role=\\'dialog\\'], ' + G + ' [role=\\'tooltip\\'], ' + G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'], ' + G + ' [class$=\\'_newSession\\'], ' + G + ' [class$=\\'_sectionHeader\\'], ' + G + ' [data-composer-card], ' + G + ' [class$=\\'_primary\\'], ' + G + ' [class$=\\'_add\\'], .cz-tips-card, .cz-tips-close { border-radius: 0 !important; }',
      // 下拉菜单 / 选项浮层 / 提示气泡 / 工作区悬浮卡：统一黑红主题样式
      G + ' [role=\\'menu\\'], ' + G + ' [role=\\'listbox\\'], ' + G + ' [role=\\'tooltip\\'], ' + G + ' [class$=\\'_card\\']:has([class$=\\'_hoverContent\\']) { background: #000 !important; border: 1px solid rgba(230, 0, 18, 0.6) !important; border-radius: 0 !important; box-shadow: 0 0 16px rgba(230, 0, 18, 0.45) !important; }',
      G + ' [role=\\'menuitem\\']:hover, ' + G + ' [role=\\'option\\']:hover { background: rgba(70, 8, 8, 0.6) !important; }',
      // 代码块（markdown 围栏）：圆角变量归零 + 各部件显式归零
      G + ' pre, ' + G + ' code { border-radius: 0 !important; }',
      G + ' .md-code-block, ' + G + ' .md-code-block pre, ' + G + ' .md-code-block code { border-radius: 0 !important; background-color: #000 !important; }',
      G + ' .md-code-block { --dsl-code-block-border-radius: 0 !important; border: 1px solid rgba(230, 0, 18, 0.45) !important; }',
      G + ' .md-code-block [class$=\\'_bannerWrap\\'], ' + G + ' .md-code-block [class$=\\'_banner\\'] { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }',
      G + ' .md-code-block pre { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }',
      // 用户消息气泡：黑红 + 直角
      G + ' [class$=\\'_userRow\\'] [class$=\\'_bubble\\'] { background: #000 !important; border: 1px solid rgba(230, 0, 18, 0.55) !important; border-radius: 0 !important; color: #f6ecec !important; box-shadow: 0 0 8px rgba(230, 0, 18, 0.25) !important; }',
      // 主题卡
      G + ' [data-tool], ' + G + ' [data-variant=\\'bash\\'], ' + G + ' [data-variant=\\'think\\'], ' + G + ' [class$=\\'_card\\']:has([data-variant=\\'bash\\']) { border-radius: 0 !important; }',
      G + ' [data-tool] [class$=\\'_title\\'], ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_title\\'], ' + G + ' [data-variant=\\'think\\'] [class$=\\'_title\\'], ' + G + ' [data-disclosure-row]:has([data-context-source]) [class$=\\'_title\\'] { color: #e60012 !important; font-weight: 700 !important; }',
      G + ' [data-tool] [class$=\\'_leading\\'] svg, ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_leading\\'] svg, ' + G + ' [data-variant=\\'think\\'] [class$=\\'_leading\\'] svg, ' + G + ' [data-disclosure-row]:has([data-context-source]) [class$=\\'_leading\\'] svg { display: none !important; }',
      G + ' [data-tool] [class$=\\'_leading\\'], ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_leading\\'], ' + G + ' [data-variant=\\'think\\'] [class$=\\'_leading\\'], ' + G + ' [data-disclosure-row]:has([data-context-source]) [class$=\\'_leading\\'] { background-size: 16px 16px; background-position: center; background-repeat: no-repeat; }',
      G + ' [data-tool] [class$=\\'_bodyWrap\\'], ' + G + ' [data-tool] [class$=\\'_terminalBody\\'], ' + G + ' [data-tool] [class$=\\'_codeBody\\'], ' + G + ' [data-tool] [class$=\\'_ioCard\\'], ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_bodyWrap\\'], ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_terminal\\'], ' + G + ' [data-variant=\\'bash\\'] [class$=\\'_ioCard\\'], ' + G + ' [data-variant=\\'think\\'] [class$=\\'_thinkBody\\'] { background: #000 !important; border-radius: 0 !important; border: 1px solid rgba(230, 0, 18, 0.45) !important; }',
      // 小贴士控件与弹窗
      G + ' .cz-tips-btn { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 0; border: 1px solid rgba(255, 215, 0, 0.7); background: rgba(30, 20, 0, 0.85); color: #ffe9c2; font-size: 11px; line-height: 1.4; cursor: pointer; box-shadow: 0 0 8px rgba(230, 0, 18, 0.45); }',
      G + ' .cz-tips-btn:hover { background: rgba(60, 40, 0, 0.9); border-color: #ffd700; }',
      G + ' .cz-tips-btn.on { border-color: #ffd700; color: #fff; box-shadow: 0 0 12px rgba(255, 215, 0, 0.55); }',
      G + ' .cz-tips-layer { position: fixed; inset: 0; pointer-events: auto; display: flex; align-items: center; justify-content: center; background: rgba(4, 0, 0, 0.62); z-index: 70; }',
      G + ' .cz-tips-card { background: #000; border: 2px solid #e60012; border-radius: 0; padding: 22px 26px; color: #f6ecec; box-shadow: 0 0 34px rgba(230, 0, 18, 0.55); min-width: 300px; max-width: 74vw; }',
      G + ' .cz-tips-title { font-size: 16px; font-weight: 700; color: #ffd700; margin-bottom: 12px; letter-spacing: 0.12em; }',
      G + ' .cz-tips-line { font-size: 14px; line-height: 1.9; color: #f6ecec; }',
      G + ' .cz-tips-close { margin-top: 16px; padding: 5px 18px; background: linear-gradient(180deg, #e60012 0%, #a3000d 100%); color: #fff; border: 1px solid #ffd700; font-size: 12px; cursor: pointer; }',
      // 主页 hero
      G + ' .cz-hero-col { display: flex; flex-direction: column; align-items: center; gap: 14px; }',
      G + ' .cz-hero-star { filter: drop-shadow(0 0 22px rgba(230, 0, 18, 0.6)) drop-shadow(0 0 5px rgba(255, 215, 0, 0.4)); }',
      G + ' .cz-hero-slogan { opacity: 0.96; filter: drop-shadow(0 0 12px rgba(230, 0, 18, 0.5)); }',
      G + ' .cz-hero-mark { border-radius: 24px; background: radial-gradient(circle at 50% 42%, #6c0f0f 0%, #2d0505 62%, #140202 100%); box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.55), 0 0 30px rgba(230, 0, 18, 0.5); }',
      G + ' [class$=\\'_titleGroup\\'] { display: none !important; }',
      // 上方信息栏暗红底
      G + ' [data-slot=\\'conversation.session.header\\'] { background: var(--dsw-specific-sidebar-fill, #110202) !important; border-bottom: 1px solid rgba(230, 0, 18, 0.4) !important; }',
      // 输入框整盒黑
      G + ' [data-composer-card] { background: #000 !important; border-color: rgba(230, 0, 18, 0.55) !important; }',
      G + ' [role=\\'textbox\\'], ' + G + ' textarea, ' + G + ' input { background: #000 !important; }',
      G + ' [class$=\\'_modes\\'] [class$=\\'_triggerIcon\\'] svg { display: none !important; }',
      G + ' [class$=\\'_modes\\'] [class$=\\'_triggerIcon\\'] { background-size: 14px 14px; background-position: center; background-repeat: no-repeat; }',
      // 模型控件红色
      G + ' [data-composer-card] [class$=\\'_trailing\\'] [class$=\\'_trigger\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.8) !important; color: #fff !important; box-shadow: 0 0 10px rgba(230, 0, 18, 0.6) !important; }',
      G + ' [data-composer-card] [class$=\\'_trailing\\'] [class$=\\'_trigger\\'] * { color: #fff !important; }',
      // 工作区行红色
      G + ' [class$=\\'_sectionHeader\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.8) !important; color: #fff !important; box-shadow: 0 0 10px rgba(230, 0, 18, 0.55) !important; }',
      G + ' [class$=\\'_sectionHeader\\'] * { color: #fff !important; }',
      // 新会话按钮红色
      G + ' [class$=\\'_newSession\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.85) !important; color: #fff !important; box-shadow: 0 0 12px rgba(230, 0, 18, 0.55) !important; }',
      // 蓝 → 红
      G + ' { --dsw-static-deepseek-50: rgb(38, 9, 9); --dsw-static-deepseek-100: rgb(58, 14, 14); --dsw-static-deepseek-200: rgb(88, 18, 18); --dsw-static-deepseek-300: rgb(140, 26, 26); --dsw-static-deepseek-400: rgb(255, 70, 70); --dsw-static-deepseek-450: rgb(255, 52, 52); --dsw-static-deepseek-500: rgb(230, 0, 18); --dsw-static-deepseek-600: rgb(180, 8, 20); --dsw-static-deepseek-700-delete: rgb(125, 8, 16); --dsw-static-deepseek-800: rgb(95, 16, 20); --dsw-static-deepseek-900: rgb(65, 12, 16); }',
      // 黑色控件红色泛光
      G + ' button, ' + G + ' select, ' + G + ' [role=\\'menuitem\\'], ' + G + ' [role=\\'option\\'], ' + G + ' [role=\\'listbox\\'], ' + G + ' [role=\\'tab\\'] { outline: 1px solid rgba(230, 0, 18, 0.5); outline-offset: 1px; box-shadow: 0 0 9px rgba(230, 0, 18, 0.3); }',
      // 显像管滤波层（增强）
      G + ' .cz-crt-layer { position: fixed; inset: 0; overflow: hidden; z-index: 40; pointer-events: none; backdrop-filter: contrast(1.07) saturate(1.1) brightness(1.02); animation: cz-on 0.4s ease-out, cz-flick 3.6s 0.4s infinite; }',
      G + ' .cz-crt-scan { position: absolute; inset: -10px; background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.34) 0px, rgba(0, 0, 0, 0.34) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 2.6px); mix-blend-mode: multiply; }',
      G + ' .cz-crt-aperture { position: absolute; inset: 0; background: repeating-linear-gradient(to right, rgba(255, 0, 0, 0.06) 0px, rgba(255, 0, 0, 0.06) 1px, rgba(0, 255, 0, 0.05) 1px, rgba(0, 255, 0, 0.05) 2px, rgba(0, 0, 255, 0.06) 2px, rgba(0, 0, 255, 0.06) 3px); }',
      G + ' .cz-crt-roll { position: absolute; left: 0; right: 0; top: -25%; height: 24%; background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.12) 55%, rgba(255, 255, 255, 0) 100%); animation: cz-roll var(--cz-roll-duration, 8.5s) linear infinite; }',
      G + ' .cz-crt-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0) 46%, rgba(0, 0, 0, 0.5) 86%, rgba(0, 0, 0, 0.68) 100%); }',
      // 顶部信息栏显像管按钮
      G + ' .cz-hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 0; border: 1px solid rgba(230, 0, 18, 0.75); background: rgba(18, 0, 0, 0.85); color: #ffd0c6; font-size: 11px; line-height: 1.4; cursor: pointer; box-shadow: 0 0 8px rgba(230, 0, 18, 0.4); }',
      G + ' .cz-hbtn:hover { background: rgba(45, 3, 3, 0.9); border-color: #ff3131; }',
      G + ' .cz-hbtn.on { border-color: #ffd700; color: #ffe9c2; box-shadow: 0 0 12px rgba(230, 0, 18, 0.75); }',
      G + ' .cz-hbtn-icon { width: 15px; height: 15px; display: inline-flex; align-items: center; justify-content: center; }',
      G + ' .cz-hbtn-icon img { width: 15px; height: 15px; object-fit: contain; }',
      G + ' .cz-hbtn-text { white-space: nowrap; }',
      // 显像管设置菜单（刷新速度 / 信号干扰开关与强度）
      G + ' .cz-crt-control { position: relative; display: inline-flex; align-items: stretch; }',
      G + ' .cz-hbtn-caret { padding: 3px 6px; border-left: none !important; }',
      G + ' .cz-crt-menu-backdrop { position: fixed; inset: 0; z-index: 55; background: rgba(0, 0, 0, 0.12); }',
      G + ' .cz-crt-menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 60; width: 236px; padding: 12px; display: flex; flex-direction: column; gap: 12px; background: #000; border: 1px solid rgba(230, 0, 18, 0.65); border-radius: 0; box-shadow: 0 0 18px rgba(230, 0, 18, 0.5); color: #f6ecec; }',
      G + ' .cz-crt-menu-title { font-size: 12px; font-weight: 700; color: #ffd700; letter-spacing: 0.08em; }',
      G + ' .cz-crt-menu-row { display: flex; flex-direction: column; gap: 4px; }',
      G + ' .cz-crt-menu-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; line-height: 1.4; color: #f6ecec; }',
      G + ' .cz-crt-menu-value { color: #ffd700; font-size: 11px; }',
      G + ' .cz-crt-menu input[type=\\'range\\'] { width: 100%; margin: 0; accent-color: #e60012; }',
      G + ' .cz-crt-menu input[type=\\'range\\']:disabled { opacity: 0.35; }',
      G + ' .cz-crt-switch { display: inline-flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 5px 10px; border: 1px solid rgba(230, 0, 18, 0.55); border-radius: 0; background: rgba(18, 0, 0, 0.85); color: #f6ecec; font-size: 12px; line-height: 1.4; cursor: pointer; }',
      G + ' .cz-crt-switch.on { border-color: #ffd700; color: #fff; box-shadow: 0 0 8px rgba(230, 0, 18, 0.45); }',
      G + ' .cz-crt-switch-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(200, 160, 160, 0.5); }',
      G + ' .cz-crt-switch.on .cz-crt-switch-dot { background: #e60012; box-shadow: 0 0 6px rgba(230, 0, 18, 0.8); }',
      // 信号干扰：SVG 位移映射扭曲滤镜（画面扭曲而非抖动）
      G + '[data-cz-interfere] { filter: url(#cz-interfere-distort); }',
      // 侧栏底部动作与头部动作
      G + ' .cz-side-action { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border: none; background: transparent; color: #e8d6d0; font-size: 12px; cursor: pointer; border-radius: 0; }',
      G + ' .cz-side-action:hover { background: rgba(70, 8, 8, 0.6); color: #ffd700; }',
      G + ' .cz-side-action img { width: 16px; height: 16px; object-fit: contain; }',
      // 设置触发内容
      G + ' .cz-settings-trigger { display: inline-flex; align-items: center; gap: 8px; }',
      G + ' .cz-settings-trigger img { width: 18px; height: 18px; object-fit: contain; }',
      G + ' .cz-settings-trigger .cz-settings-label { color: inherit; font-size: 13px; }',
      // 主题化工具卡片
      G + ' .cz-toolcard { border: 1px solid rgba(230, 0, 18, 0.45); border-radius: 0; background: #000; padding: 8px 10px; }',
      G + ' .cz-toolcard-head { display: flex; align-items: center; gap: 8px; }',
      G + ' .cz-toolcard-head img { object-fit: contain; }',
      G + ' .cz-toolcard-name { flex: 1; font-weight: 600; font-size: 12px; color: #f6ecec; }',
      G + ' .cz-toolcard-status { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #c8a0a0; }',
      G + ' .cz-toolcard-pre { margin: 6px 0 0; padding: 6px 8px; background: rgba(20, 0, 0, 0.8); border: 1px solid rgba(230, 0, 18, 0.3); color: #e8d6d0; font-family: Consolas, \\'Courier New\\', monospace; font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow: auto; }',
      G + ' .cz-toolcard-pre.cz-error { color: #ff6b6b; border-color: rgba(255, 49, 49, 0.6); }',
      '@keyframes cz-on { from { opacity: 0.1; } to { opacity: 1; } }',
      '@keyframes cz-flick { 0%, 100% { opacity: 1; } 50% { opacity: 0.955; } }',
      '@keyframes cz-roll { from { transform: translateY(0); } to { transform: translateY(560%); } }',
    ].join('\\n')), 'changzheng: styles')

    function BrandMark() {
      const src = useIcon('logo')
      return React.createElement('div', { className: 'cz-brand-wrap', style: { width: '112px', height: '112px' } },
        src
          ? React.createElement('img', { className: 'cz-brand-mark cz-brand-img', src: src, alt: '长征', style: { width: '100%', height: '100%', objectFit: 'contain' } })
          : React.createElement('div', { className: 'cz-brand-mark cz-brand-img', style: { width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 50% 42%, #5c0d0d 0%, #2a0505 62%, #120202 100%)', boxShadow: '0 0 0 1px rgba(255, 215, 0, 0.5), 0 0 12px rgba(230, 0, 18, 0.45)' } })
      )
    }
    function BrandName() { return null }
    function HeroMark() {
      const star = useIcon('thinking')
      const slogan = useIcon('serve')
      return React.createElement('div', { className: 'cz-hero-col', style: { width: '100%' } },
        React.createElement('div', { className: 'cz-hero-mark', style: { width: '128px', height: '128px' } },
          star ? React.createElement('img', { className: 'cz-hero-star', src: star, alt: '', style: { width: '128px', height: '128px', objectFit: 'contain' } }) : null
        ),
        slogan ? React.createElement('img', { className: 'cz-hero-slogan', src: slogan, alt: '为人民服务', style: { width: '256px', maxWidth: '70vw', height: 'auto' } }) : null
      )
    }

    function CrtFilterLayer(props) {
      const on = props.useCrtSettings(function (s) { return s.on })
      if (!on) return null
      return React.createElement('div', { className: 'cz-crt-layer' },
        React.createElement('div', { className: 'cz-crt-scan' }),
        React.createElement('div', { className: 'cz-crt-aperture' }),
        React.createElement('div', { className: 'cz-crt-roll' }),
        React.createElement('div', { className: 'cz-crt-vignette' })
      )
    }
    function SettingsMenuPanel(props) {
      const settings = props.useCrtSettings(function (s) { return s })
      return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'cz-crt-menu-backdrop', onClick: props.closeMenu }),
        React.createElement('div', {
          className: 'cz-crt-menu',
          role: 'dialog',
          'aria-label': '显像管设置',
          tabIndex: -1,
          autoFocus: true,
          onKeyDown: function (e) { if (e.key === 'Escape') props.closeMenu() },
        },
          React.createElement('div', { className: 'cz-crt-menu-title' }, '显像管设置'),
          React.createElement('label', { className: 'cz-crt-menu-row' },
            React.createElement('span', { className: 'cz-crt-menu-label' },
              React.createElement('span', null, '刷新速度'),
              React.createElement('span', { className: 'cz-crt-menu-value' }, String(settings.refresh))
            ),
            React.createElement('input', {
              type: 'range', min: 1, max: 10, step: 1, value: settings.refresh,
              'aria-label': '刷新速度',
              onChange: function (e) { props.setRefresh(Number(e.target.value)) },
            })
          ),
          React.createElement('div', { className: 'cz-crt-menu-row' },
            React.createElement('button', {
              type: 'button', role: 'switch',
              'aria-checked': settings.interfere,
              'aria-label': '开启或关闭信号干扰',
              className: settings.interfere ? 'cz-crt-switch on' : 'cz-crt-switch',
              onClick: function () { props.setInterfere(!settings.interfere) },
            },
              React.createElement('span', null, '信号干扰'),
              React.createElement('span', { className: 'cz-crt-switch-dot', 'aria-hidden': true })
            )
          ),
          React.createElement('label', { className: 'cz-crt-menu-row' },
            React.createElement('span', { className: 'cz-crt-menu-label' },
              React.createElement('span', null, '强度'),
              React.createElement('span', { className: 'cz-crt-menu-value' }, String(settings.strength))
            ),
            React.createElement('input', {
              type: 'range', min: 1, max: 10, step: 1, value: settings.strength,
              disabled: !settings.interfere,
              'aria-label': '强度',
              onChange: function (e) { props.setStrength(Number(e.target.value)) },
            })
          )
        )
      )
    }
    function CrtToggle(props) {
      const settings = props.useCrtSettings(function (s) { return s })
      const menuOn = props.useCrtMenuOn(function (v) { return v })
      const star = useIcon('star')
      const label = settings.on ? '关闭显像管电视滤波特效' : '开启显像管电视滤波特效'
      return React.createElement('span', { className: 'cz-crt-control' },
        React.createElement('button', {
          type: 'button',
          className: settings.on ? 'cz-hbtn on' : 'cz-hbtn',
          onClick: props.toggleCrt,
          'aria-pressed': settings.on,
          'aria-label': label,
          title: label,
        },
          React.createElement('span', { className: 'cz-hbtn-icon' },
            star ? React.createElement('img', { src: star, alt: '' }) : React.createElement('span', null, '★')
          ),
          React.createElement('span', { className: 'cz-hbtn-text' }, '显像管')
        ),
        React.createElement('button', {
          type: 'button',
          className: menuOn ? 'cz-hbtn cz-hbtn-caret on' : 'cz-hbtn cz-hbtn-caret',
          onClick: props.toggleMenu,
          'aria-expanded': menuOn,
          'aria-label': '打开显像管设置',
          title: '打开显像管设置',
        },
          React.createElement('span', { 'aria-hidden': true }, '▾')
        ),
        menuOn ? React.createElement(SettingsMenuPanel, {
          useCrtSettings: props.useCrtSettings,
          closeMenu: props.closeMenu,
          setRefresh: props.setRefresh,
          setInterfere: props.setInterfere,
          setStrength: props.setStrength,
        }) : null
      )
    }
    function TipsButton(props) {
      const on = props.useTipsOn(function (v) { return v })
      return React.createElement('button', {
        type: 'button',
        className: on ? 'cz-tips-btn on' : 'cz-tips-btn',
        onClick: props.toggleTips,
        'aria-pressed': on,
        title: '小贴士',
      }, React.createElement('span', null, '小贴士'))
    }
    function TipsModal(props) {
      const on = props.useTipsOn(function (v) { return v })
      if (!on) return null
      return React.createElement('div', { className: 'cz-tips-layer', onClick: props.closeTips },
        React.createElement('div', { className: 'cz-tips-card', onClick: function (e) { e.stopPropagation() } },
          React.createElement('div', { className: 'cz-tips-title' }, '小贴士'),
          React.createElement('div', { className: 'cz-tips-line' }, '1.兵贵神速'),
          React.createElement('div', { className: 'cz-tips-line' }, '2.欲速则不达'),
          React.createElement('div', { className: 'cz-tips-line' }, '3.人心齐，泰山移'),
          React.createElement('button', { type: 'button', className: 'cz-tips-close', onClick: function () { props.closeTips() } }, '关闭')
        )
      )
    }

    function SettingsTrigger(props) {
      const icon = useIcon('settings')
      return React.createElement('span', { className: 'cz-settings-trigger' },
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', { style: { color: '#ffd700' } }, '⚙'),
        props.wide ? React.createElement('span', { className: 'cz-settings-label' }, '设置') : null
      )
    }
    function NewSessionAction(props) {
      const icon = useIcon('new')
      return React.createElement('button', {
        type: 'button',
        className: 'cz-side-action',
        onClick: props.startSession,
        title: '新建会话',
      },
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', null, '✦'),
        props.wide ? React.createElement('span', null, '新建会话') : null
      )
    }
    function ForkAction(props) {
      const icon = useIcon('fork')
      return React.createElement('button', {
        type: 'button',
        className: 'cz-side-action',
        onClick: function () { props.forkSession(props.sessionId) },
        title: '以当前会话分叉出新会话',
      },
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', null, '⑂'),
        React.createElement('span', null, '分叉')
      )
    }
    const TOOL_ICONS = {
      read: 'read', read_image: 'read', glob: 'read', grep: 'read',
      write: 'write', edit: 'write',
      todo_write: 'complete',
    }
    const STATUS_TEXT = { thinking: '思考中', ok: '完成', error: '报错' }
    function resultText(block) {
      if (block.kind !== 'tool-result') return ''
      const parts = []
      const content = block.content || []
      for (let i = 0; i < content.length; i += 1) {
        const c = content[i]
        if (c && typeof c.text === 'string') parts.push(c.text)
      }
      return parts.join('\\n')
    }
    function ThemedToolCard(props) {
      const block = props.block
      const settled = block !== null && typeof block === 'object' && block.kind === 'tool-result'
      const isError = settled && block.isError === true
      const status = !settled ? 'thinking' : isError ? 'error' : 'ok'
      const toolIcon = useIcon(TOOL_ICONS[props.toolName] || 'star')
      const statusIcon = useIcon(status === 'thinking' ? 'thinking' : status === 'error' ? 'error' : 'complete')
      const argsRaw = settled ? (block.call ? block.call.argsRaw : '') : block.argsRaw || ''
      const body = settled ? resultText(block) : ''
      const argsHead = argsRaw.length > 160 ? argsRaw.slice(0, 160) + '…' : argsRaw
      const bodyHead = body.length > 900 ? body.slice(0, 900) + '…' : body
      return React.createElement('div', { className: 'cz-toolcard' },
        React.createElement('div', { className: 'cz-toolcard-head' },
          statusIcon ? React.createElement('img', { src: statusIcon, alt: '', style: { width: '18px', height: '18px' } }) : null,
          toolIcon ? React.createElement('img', { src: toolIcon, alt: '', style: { width: '14px', height: '14px' } }) : null,
          React.createElement('span', { className: 'cz-toolcard-name' }, props.toolName),
          React.createElement('span', { className: 'cz-toolcard-status' }, STATUS_TEXT[status])
        ),
        argsHead !== '' ? React.createElement('pre', { className: 'cz-toolcard-pre' }, argsHead) : null,
        isError && bodyHead !== ''
          ? React.createElement('pre', { className: 'cz-toolcard-pre cz-error' }, bodyHead)
          : (!isError && bodyHead !== '' ? React.createElement('pre', { className: 'cz-toolcard-pre' }, bodyHead) : null)
      )
    }

    let uiDisposers = []
    let uiMounted = false
    function mountThemeUi() {
      const d = []
      d.push(slots.inject('sidebar.brand.mark', () => slots.register({ name: 'sidebar.brand.mark' }, BrandMark)))
      d.push(slots.inject('sidebar.brand.name', () => slots.register({ name: 'sidebar.brand.name' }, BrandName)))
      d.push(slots.inject('conversation.hero.brand.mark', () => slots.register({ name: 'conversation.hero.brand.mark' }, HeroMark)))
      d.push(slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay', id: 'changzheng-crt-filter', order: 50,
        inject: function () { return { hooks: { crtSettings: crtSettings } } },
      }, CrtFilterLayer)))
      d.push(slots.inject('shell.overlay', () => slots.register({
        name: 'shell.overlay', id: 'changzheng-tips-modal', order: 60,
        inject: function () {
          return {
            closeTips: function () { setTips(false) },
            hooks: { tipsOn: tips },
          }
        },
      }, TipsModal)))
      d.push(slots.inject('conversation.session.header.utilities', () => slots.register({
        name: 'conversation.session.header.utilities', id: 'changzheng-crt', order: 10,
        inject: function () {
          return {
            toggleCrt: crtSettings.toggleCrt,
            toggleMenu: crtMenu.toggle,
            closeMenu: function () { crtMenu.set(false) },
            setRefresh: crtSettings.setRefresh,
            setInterfere: crtSettings.setInterfere,
            setStrength: crtSettings.setStrength,
            hooks: { crtSettings: crtSettings, crtMenuOn: crtMenu },
          }
        },
      }, CrtToggle)))
      d.push(slots.inject('conversation.session.header.utilities', () => slots.register({
        name: 'conversation.session.header.utilities', id: 'changzheng-tips', order: 11,
        inject: function () { return { toggleTips: toggleTips, hooks: { tipsOn: tips } } },
      }, TipsButton)))
      d.push(slots.inject('settings.trigger', () => slots.register({ name: 'settings.trigger' }, SettingsTrigger)))
      d.push(slots.inject('sidebar.footer.action', () => slots.register({
        name: 'sidebar.footer.action', id: 'changzheng-new', order: -5,
        inject: function () {
          return {
            startSession: function () {
              const ui = ctx.get('uiWorkspace')
              if (ui !== undefined) ui.startSession()
            },
          }
        },
      }, NewSessionAction)))
      d.push(slots.inject('conversation.session.header.actions', () => slots.register({
        name: 'conversation.session.header.actions', id: 'changzheng-fork', order: 60,
        inject: function () {
          return {
            forkSession: function (sessionId) {
              const sessions = ctx.get('sessions')
              if (sessions !== undefined) sessions.fork({ sessionId: sessionId })
            },
          }
        },
      }, ForkAction)))
      d.push(slots.inject('tool.call.toolview', () => {
        const disposers = []
        for (const key of ['read', 'read_image', 'glob', 'grep', 'write', 'edit', 'todo_write']) {
          disposers.push(slots.register({ name: 'tool.call.toolview', key: key }, ThemedToolCard))
        }
        return function () {
          for (const r of disposers) r()
        }
      }))
      d.push(ctx.effect(() => {
        const owned = []
        Promise.all([
          loadIcon('star'),
          loadIcon('read'),
        ]).then(function (urls) {
          const star = urls[0]
          const read = urls[1]
          if (star !== null) {
            owned.push(styles.insert(
              '[class$=\\'_folder\\'] svg, [class$=\\'_folderActive\\'] svg { display: none !important; } ' +
              '[class$=\\'_folder\\'], [class$=\\'_folderActive\\'] { background-image: url(\\'' + star + '\\'); background-size: contain; background-repeat: no-repeat; background-position: center; }'
            ))
            owned.push(styles.insert(
              '[data-tool] [class$=\\'_leading\\'], [data-variant=\\'bash\\'] [class$=\\'_leading\\'], [data-variant=\\'think\\'] [class$=\\'_leading\\'], [data-disclosure-row]:has([data-context-source]) [class$=\\'_leading\\'] { background-image: url(\\'' + star + '\\'); }'
            ))
          }
          if (read !== null) {
            owned.push(styles.insert(
              '[class$=\\'_modes\\'] [class$=\\'_triggerIcon\\'] { background-image: url(\\'' + read + '\\'); }'
            ))
          }
        })
        return function () {
          for (const x of owned) x()
        }
      }))
      return d
    }
    function unmountThemeUi() {
      for (const d of uiDisposers) d()
      uiDisposers = []
    }
    function syncTheme(snapshot) {
      const on = snapshot.active.id === 'changzheng'
      if (on === uiMounted) return
      uiMounted = on
      if (on) uiDisposers = mountThemeUi()
      else unmountThemeUi()
    }
    syncTheme(theme.getTheme())
    ctx.on('theme/change', syncTheme)
  },
}
