/* ============================================================================
 * 长征主题 changzheng（V1.3 / 重建 pkg-1）—�?Client 半区
 * ----------------------------------------------------------------------------
 * 部署方式：本文件内容整体作为 cordis_define �?code.client 参数传入�? * 本文件是一个纯 JS 函数体（返回 Cordis Plugin 对象），不能独立运行�? *
 * V1.5 变更�? *   1. 主题切换并入「外观」行：设�?�?常规 �?Appearance 行替换为四个立方
 *      （浅�?/ 深色 / 跟随系统 / 长征·红星），任何主题下可用；移除原独�? *      「长征主�?· 黑红」设置行�? *   2. 主题注册时序容错：register 冲突（旧 fiber 未注销）时 400ms 重试�? *      修复“切换按钮消�?主题未注册”问题�? *   3. 全部保留：主题门控（--cz-changzheng-active 标记，仅激活时生效）�? *      112px 居中 logo、代码块/用户消息黑红直角、主题化工具卡�? *      CRT 增强、小贴士弹窗、“为人民服务�?..”等�? *
 * 向后兼容：类名规则依赖产�?CSS-module 类名（[hash]_[local] 模式）；若目�? *   dsh 版本组件类名变化，对�?CSS 规则失效，但插槽功能与主题色不受影响�? * ========================================================================== */
return {
  apply(ctx) {
    const theme = ctx.get('theme')
    const slots = ctx.get('slots')

    if (theme !== undefined) {
      // 注册主题（时序容错：更新时旧 fiber 注销可能尚未完成，register 抛“already registered”，稍后重试�?      ctx.effect(() => {
        let closed = false
        let themeDispose = null
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
                // 主题激活标记：仅当 changzheng 激活时�?presenter 内联�?body，用于门控全部样�?                '--cz-changzheng-active': '1',
              },
            })
          } catch (error) {
            const timer = ctx.get('timer')
            if (timer !== undefined) timer.timeout(registerTheme, 400)
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

    const G = 'body[style*="--cz-changzheng-active"]'

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

    const crt = {
      value: false,
      listeners: new Set(),
      getSnapshot: function () { return crt.value },
      subscribe: function (fn) {
        crt.listeners.add(fn)
        return function () { crt.listeners.delete(fn) }
      },
    }
    const toggleCrt = function () {
      crt.value = !crt.value
      crt.listeners.forEach(function (fn) { fn() })
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

    const activeId = {
      getSnapshot: function () { return theme.getTheme().active.id },
      subscribe: function (listener) { return ctx.on('theme/change', function () { listener() }) },
    }

    ctx.effect(() => styles.insert([
      // logo：居�?112px 直贴
      G + ' .cz-brand-mark { filter: drop-shadow(0 0 8px rgba(230, 0, 18, 0.6)); }',
      G + ' [class*=\\'_brand\\'] { background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; }',
      G + ' [class*=\\'_brand\\']:hover { background: transparent !important; }',
      G + ' [class*=\\'_brandIdentity\\'] { height: auto !important; }',
      G + ' [class$=\\'_logoRow\\'] { height: 132px !important; position: relative; }',
      G + ' [class*=\\'_collapsed\\'] [class$=\\'_logoRow\\'] { height: 50px !important; }',
      G + ' [class$=\\'_logoRow\\'] > [class*=\\'_brand\\'] { position: absolute !important; inset: 0 !important; width: 100% !important; display: inline-flex; align-items: center; justify-content: center; }',
      G + ' [class$=\\'_logoRow\\'] [class*=\\'_iconButton\\'] { position: relative !important; z-index: 2 !important; }',
      G + ' [class*=\\'_brandMark\\'] .cz-brand-wrap, ' + G + ' [class*=\\'_brandMark\\'] .cz-brand-img { width: 112px !important; height: 112px !important; }',
      G + ' [class$=\\'_railMark\\'] .cz-brand-wrap, ' + G + ' [class$=\\'_railMark\\'] .cz-brand-img { width: 46px !important; height: 46px !important; }',
      // 深度求索�?.. �?为人民服务中...
      G + ' [class$=\\'_turnStatus\\'] { font-size: 0 !important; }',
      G + ' [class$=\\'_turnStatus\\']::after { content: \\'为人民服务中...\\'; font-size: var(--dsh-content-font-size, 14px) !important; line-height: calc(22px + var(--dsh-content-font-delta, 0px)) !important; }',
      // 设置控件：红�?+ 直角
      G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.85) !important; color: #fff !important; box-shadow: 0 0 12px rgba(230, 0, 18, 0.55) !important; }',
      G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'] * { color: #fff !important; }',
      // 全局直角
      G + ' button, ' + G + ' input, ' + G + ' textarea, ' + G + ' select, ' + G + ' [role=\\'menuitem\\'], ' + G + ' [role=\\'option\\'], ' + G + ' [role=\\'listbox\\'], ' + G + ' [role=\\'tab\\'], ' + G + ' [role=\\'dialog\\'], ' + G + ' [class$=\\'_triggerRow\\'] [class$=\\'_trigger\\'], ' + G + ' [class$=\\'_newSession\\'], ' + G + ' [class$=\\'_sectionHeader\\'], ' + G + ' [data-composer-card], ' + G + ' [class$=\\'_primary\\'], ' + G + ' [class$=\\'_add\\'], .cz-tips-card, .cz-tips-close { border-radius: 0 !important; }',
      // 代码块（markdown 围栏）：圆角变量归零 + 各部件显式归�?      G + ' pre, ' + G + ' code { border-radius: 0 !important; }',
      G + ' .md-code-block, ' + G + ' .md-code-block pre, ' + G + ' .md-code-block code { border-radius: 0 !important; background-color: #000 !important; }',
      G + ' .md-code-block { --dsl-code-block-border-radius: 0 !important; border: 1px solid rgba(230, 0, 18, 0.45) !important; }',
      G + ' .md-code-block [class$=\\'_bannerWrap\\'], ' + G + ' .md-code-block [class$=\\'_banner\\'] { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }',
      G + ' .md-code-block pre { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; }',
      // 用户消息气泡：黑�?+ 直角
      G + ' [class$=\\'_userRow\\'] [class$=\\'_bubble\\'] { background: #000 !important; border: 1px solid rgba(230, 0, 18, 0.55) !important; border-radius: 0 !important; color: #f6ecec !important; box-shadow: 0 0 8px rgba(230, 0, 18, 0.25) !important; }',
      // 主题�?      G + ' [data-tool], ' + G + ' [data-variant=\\'bash\\'], ' + G + ' [data-variant=\\'think\\'], ' + G + ' [class$=\\'_card\\']:has([data-variant=\\'bash\\']) { border-radius: 0 !important; }',
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
      // 新会话按钮红�?      G + ' [class$=\\'_newSession\\'] { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%) !important; border: 1px solid rgba(255, 215, 0, 0.85) !important; color: #fff !important; box-shadow: 0 0 12px rgba(230, 0, 18, 0.55) !important; }',
      // �?�?�?      G + ' { --dsw-static-deepseek-50: rgb(38, 9, 9); --dsw-static-deepseek-100: rgb(58, 14, 14); --dsw-static-deepseek-200: rgb(88, 18, 18); --dsw-static-deepseek-300: rgb(140, 26, 26); --dsw-static-deepseek-400: rgb(255, 70, 70); --dsw-static-deepseek-450: rgb(255, 52, 52); --dsw-static-deepseek-500: rgb(230, 0, 18); --dsw-static-deepseek-600: rgb(180, 8, 20); --dsw-static-deepseek-700-delete: rgb(125, 8, 16); --dsw-static-deepseek-800: rgb(95, 16, 20); --dsw-static-deepseek-900: rgb(65, 12, 16); }',
      // 黑色控件红色泛光
      G + ' button, ' + G + ' select, ' + G + ' [role=\\'menuitem\\'], ' + G + ' [role=\\'option\\'], ' + G + ' [role=\\'listbox\\'], ' + G + ' [role=\\'tab\\'] { outline: 1px solid rgba(230, 0, 18, 0.5); outline-offset: 1px; box-shadow: 0 0 9px rgba(230, 0, 18, 0.3); }',
      // 外观行（始终可见，任何主题下都能切换；含浅色/深色/跟随系统/长征�?      '.cz-appear-group { display: flex; flex-direction: column; gap: 8px; }',
      '.cz-appear-title { color: var(--dsw-alias-label-primary, inherit); font-size: 13px; font-weight: 600; }',
      '.cz-appear-row { display: flex; gap: 8px; flex-wrap: wrap; }',
      '.cz-appear-cube { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--dsw-alias-border-l1, rgba(128, 128, 128, 0.4)); border-radius: 0; background: var(--dsw-alias-bg-layer-1, transparent); color: var(--dsw-alias-label-primary, inherit); font-size: 12px; line-height: 1.4; cursor: pointer; }',
      '.cz-appear-cube:hover { border-color: rgba(230, 0, 18, 0.6); }',
      '.cz-appear-cube.on { background: linear-gradient(180deg, #e60012 0%, #a3000d 100%); color: #fff !important; border-color: #ffd700; box-shadow: 0 0 10px rgba(230, 0, 18, 0.5); }',
      '.cz-appear-cube img { width: 16px; height: 16px; object-fit: contain; }',
      // 显像管滤波层（增强）
      G + ' .cz-crt-layer { position: fixed; inset: 0; overflow: hidden; z-index: 40; pointer-events: none; backdrop-filter: contrast(1.07) saturate(1.1) brightness(1.02); animation: cz-on 0.4s ease-out, cz-flick 3.6s 0.4s infinite; }',
      G + ' .cz-crt-scan { position: absolute; inset: -10px; background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.34) 0px, rgba(0, 0, 0, 0.34) 1px, rgba(0, 0, 0, 0) 1px, rgba(0, 0, 0, 0) 2.6px); mix-blend-mode: multiply; }',
      G + ' .cz-crt-aperture { position: absolute; inset: 0; background: repeating-linear-gradient(to right, rgba(255, 0, 0, 0.06) 0px, rgba(255, 0, 0, 0.06) 1px, rgba(0, 255, 0, 0.05) 1px, rgba(0, 255, 0, 0.05) 2px, rgba(0, 0, 255, 0.06) 2px, rgba(0, 0, 255, 0.06) 3px); }',
      G + ' .cz-crt-roll { position: absolute; left: 0; right: 0; top: -25%; height: 24%; background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.12) 55%, rgba(255, 255, 255, 0) 100%); animation: cz-roll 8.5s linear infinite; }',
      G + ' .cz-crt-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0) 46%, rgba(0, 0, 0, 0.5) 86%, rgba(0, 0, 0, 0.68) 100%); }',
      // 顶部信息栏显像管按钮
      G + ' .cz-hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 0; border: 1px solid rgba(230, 0, 18, 0.75); background: rgba(18, 0, 0, 0.85); color: #ffd0c6; font-size: 11px; line-height: 1.4; cursor: pointer; box-shadow: 0 0 8px rgba(230, 0, 18, 0.4); }',
      G + ' .cz-hbtn:hover { background: rgba(45, 3, 3, 0.9); border-color: #ff3131; }',
      G + ' .cz-hbtn.on { border-color: #ffd700; color: #ffe9c2; box-shadow: 0 0 12px rgba(230, 0, 18, 0.75); }',
      G + ' .cz-hbtn-icon { width: 15px; height: 15px; display: inline-flex; align-items: center; justify-content: center; }',
      G + ' .cz-hbtn-icon img { width: 15px; height: 15px; object-fit: contain; }',
      G + ' .cz-hbtn-icon span { color: #ffd700; font-size: 12px; line-height: 1; }',
      G + ' .cz-hbtn-text { white-space: nowrap; }',
      // 侧栏底部动作与头部动�?      G + ' .cz-side-action { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border: none; background: transparent; color: #e8d6d0; font-size: 12px; cursor: pointer; border-radius: 0; }',
      G + ' .cz-side-action:hover { background: rgba(70, 8, 8, 0.6); color: #ffd700; }',
      G + ' .cz-side-action img { width: 16px; height: 16px; object-fit: contain; }',
      // 设置触发内容
      G + ' .cz-settings-trigger { display: inline-flex; align-items: center; gap: 8px; }',
      G + ' .cz-settings-trigger img { width: 18px; height: 18px; object-fit: contain; }',
      G + ' .cz-settings-trigger .cz-settings-label { color: inherit; font-size: 13px; }',
      // 主题化工具卡�?      G + ' .cz-toolcard { border: 1px solid rgba(230, 0, 18, 0.45); border-radius: 0; background: #000; padding: 8px 10px; }',
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
        slogan ? React.createElement('img', { className: 'cz-hero-slogan', src: slogan, alt: '为人民服�?, style: { width: '256px', maxWidth: '70vw', height: 'auto' } }) : null
      )
    }
    function CrtFilterLayer(props) {
      const on = props.useCrtOn(function (v) { return v })
      if (!on) return null
      return React.createElement('div', { className: 'cz-crt-layer' },
        React.createElement('div', { className: 'cz-crt-scan' }),
        React.createElement('div', { className: 'cz-crt-aperture' }),
        React.createElement('div', { className: 'cz-crt-roll' }),
        React.createElement('div', { className: 'cz-crt-vignette' })
      )
    }
    function CrtToggle(props) {
      const on = props.useCrtOn(function (v) { return v })
      const star = useIcon('star')
      return React.createElement('button', {
        type: 'button',
        className: on ? 'cz-hbtn on' : 'cz-hbtn',
        onClick: props.toggleCrt,
        'aria-pressed': on,
        'aria-label': on ? '关闭显像管电视滤波特�? : '开启显像管电视滤波特效',
        title: on ? '显像管电视滤波：开（点击关闭）' : '显像管电视滤波：关（点击开启）',
      },
        React.createElement('span', { className: 'cz-hbtn-icon' },
          star ? React.createElement('img', { src: star, alt: '' }) : React.createElement('span', null, '�?)
        ),
        React.createElement('span', { className: 'cz-hbtn-text' }, '显像�?)
      )
    }
    function TipsButton(props) {
      const on = props.useTipsOn(function (v) { return v })
      return React.createElement('button', {
        type: 'button',
        className: on ? 'cz-tips-btn on' : 'cz-tips-btn',
        onClick: props.toggleTips,
        'aria-pressed': on,
        title: '小贴�?,
      }, React.createElement('span', null, '小贴�?))
    }
    function TipsModal(props) {
      const on = props.useTipsOn(function (v) { return v })
      if (!on) return null
      return React.createElement('div', { className: 'cz-tips-layer', onClick: props.closeTips },
        React.createElement('div', { className: 'cz-tips-card', onClick: function (e) { e.stopPropagation() } },
          React.createElement('div', { className: 'cz-tips-title' }, '小贴�?),
          React.createElement('div', { className: 'cz-tips-line' }, '1.兵贵神�?),
          React.createElement('div', { className: 'cz-tips-line' }, '2.欲速则不达'),
          React.createElement('div', { className: 'cz-tips-line' }, '3.人心齐，泰山�?),
          React.createElement('button', { type: 'button', className: 'cz-tips-close', onClick: function () { props.closeTips() } }, '关闭')
        )
      )
    }

    // 外观行：浅色 / 深色 / 跟随系统 / 长征主题（始终可见，替换产品 Appearance 行）
    function AppearanceRow(props) {
      const active = props.useThemeActive(function (id) { return id })
      const star = useIcon('star')
      const cubes = [
        { id: 'light', label: '浅色' },
        { id: 'dark', label: '深色' },
        { id: 'system', label: '跟随系统' },
        { id: 'changzheng', label: '长征', icon: star },
      ]
      return React.createElement('div', { className: 'cz-appear-group' },
        React.createElement('div', { className: 'cz-appear-title' }, '外观'),
        React.createElement('div', { className: 'cz-appear-row' },
          cubes.map(function (cube) {
            return React.createElement('button', {
              key: cube.id,
              type: 'button',
              className: active === cube.id ? 'cz-appear-cube on' : 'cz-appear-cube',
              'aria-pressed': active === cube.id,
              onClick: function () { props.setTheme(cube.id) },
            },
              cube.icon ? React.createElement('img', { src: cube.icon, alt: '' }) : null,
              React.createElement('span', null, cube.label)
            )
          })
        )
      )
    }

    function SettingsTrigger(props) {
      const icon = useIcon('settings')
      return React.createElement('span', { className: 'cz-settings-trigger' },
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', { style: { color: '#ffd700' } }, '�?),
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
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', null, '�?),
        props.wide ? React.createElement('span', null, '新建会话') : null
      )
    }
    function ForkAction(props) {
      const icon = useIcon('fork')
      return React.createElement('button', {
        type: 'button',
        className: 'cz-side-action',
        onClick: function () { props.forkSession(props.sessionId) },
        title: '以当前会话分叉出新会�?,
      },
        icon ? React.createElement('img', { src: icon, alt: '' }) : React.createElement('span', null, '�?),
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
      const argsHead = argsRaw.length > 160 ? argsRaw.slice(0, 160) + '�? : argsRaw
      const bodyHead = body.length > 900 ? body.slice(0, 900) + '�? : body
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
        inject: function () { return { toggleCrt: toggleCrt, hooks: { crtOn: crt } } },
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
        inject: function () { return { toggleCrt: toggleCrt, hooks: { crtOn: crt } } },
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

    // 外观行：始终注册（浅�?深色/跟随系统/长征 一键切换）
    slots.inject('settings.general.item', () => slots.register({
      name: 'settings.general.item', id: 'appearance', order: 10,
      inject: function () {
        return { setTheme: function (id) { theme.setTheme(id) }, hooks: { themeActive: activeId } }
      },
    }, AppearanceRow))
  },
}
