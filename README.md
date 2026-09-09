# 长征主题 changzheng V1（DeepSeek Harness Web 主题插件）

黑红配色、长征红星图标集、显像管电视特效的动态插件包。独立于浅色/深色主题，可在「设置 → 常规 → 长征主题 · 黑红」中一键启用/停用。

## 目录结构

```
changzheng V1/
├── host.js          # Host 半区源码（图标资源服务 RPC）
├── client.js        # Client 半区源码（主题 + 全部界面自定义）
├── manifest.json    # 插件清单（名称/版本/图标映射/功能列表）
├── README.md        # 中文说明（本文件）
├── README_EN.md     # English
├── README_JP.md     # 日本語
├── README_Nya.md    # 喵语/meow 彩蛋
└── assets/          # 主题用到的全部 PNG 资产（12 张）
    ├── logo.png                  # 左上角品牌徽标（112px 居中）
    ├── star.png                  # 左侧项目文件夹图标 / CRT 按钮 / 工具卡默认图标
    ├── settings.png              # 设置入口图标
    ├── new.png                   # 新建会话入口图标
    ├── 新分支.png                 # 会话「分叉」动作图标
    ├── read.png                  # 读取类工具卡（read/glob/grep/read_image）+ 指令控件图标
    ├── write.png                 # 写入/编辑工具卡（write/edit）
    ├── complete.png              # 完成态 / todo_write 工具卡
    ├── error.png                 # 报错态图标
    ├── thinking.png              # 思考态 / hero 放射红星
    ├── serve-the-people.png      # hero「为人民服务」横幅
    └── redo.png                  # 备用（暂无扩展点，展示于设置行图览）
```

## 部署到其他 dsh 环境

### 1. 放置文件

把整个 `changzheng V1` 文件夹放到目标环境**会话工作区根目录**（例如 `D:\dsh0\changzheng V1`），保持 `assets/` 内 12 张 PNG 完整。

Host 侧按以下顺序查找图标（相对路径按会话工作区解析）：

1. `changzheng V1/assets/`（推荐，随包自带）
2. `main-changzheng/`（兼容旧目录）
3. `D:\dsh0\main-changzheng`（开发机绝对路径兜底）

### 2. 注册插件

在 dsh Web GUI 通过动态插件接口注册（新环境使用新的语义前缀亦可，如 `czthm`）：

```js
cordis_define({
  plugin: { kind: 'new', idPrefix: 'czthm' },
  name: '长征主题 · 显像管特效',
  purpose: '黑红长征主题：独立主题、外观切换、logo、显像管特效与全套图标应用。',
  code: {
    host:   host.js 全文,
    client: client.js 全文,
  },
})
```

然后 `cordis_run` 激活（首次需要用户在界面批准，审批策略为 `ask` 时弹出确认框）。

### 3. 可选：切换主题色

主题为注册型主题（id `changzheng`）。新版 dsh（内置 changzheng 主题）直接在「设置 → 常规 → 外观」点「长征」立方体；旧版 dsh 使用 V1.5 插件自带的外观行替换（V1.6 已移除该替换，避免与产品内置行冲突）。

## 功能清单（V1.6 / 重建运行包 pkg-2）

| 领域 | 内容 |
| --- | --- |
| 外观栏切换 | 由新版 dsh 内置「设置 → 常规 → 外观」的四立方切换承担：**浅色 / 深色 / 跟随系统 / 长征（红星）**；V1.6 不再注册产品 Appearance 行 |
| 主题门控 | `body:is([data-ds-theme="changzheng"], [style*="--cz-changzheng-active"])` —— 同时兼容新版 dsh（presenter 写 `data-ds-theme`）与旧版标记变量；样式与 UI 仅在 changzheng 激活时生效，切换回浅色/深色整体卸载 |
| 独立主题 | 注册 `changzheng` 主题（黑底 `#0c0000`、主红 `#e60012`、金描边点缀），独立于 light/dark/system |
| 注册容错 | 新版 dsh 内置 changzheng 时 `theme.register` 报 `already registered` 视为成功（颜色令牌由产品提供）；旧版冲突按 400ms 最多重试 5 次 |
| 全局配色 | DeepSeek 蓝色板整体重映射为红色（发送按钮/链接/选中态/业务强调/设置控件），全控件红色泛光描边 |
| 造型 | 所有按钮、输入、菜单、选项卡、长框控件统一直角（`border-radius: 0`） |
| 品牌 | 左上角 logo.png 112px 居中直贴（无外框），点击 = 新建会话；主页 hero：128px 放射红星 + 256px「为人民服务」，隐藏原「探索未至之境 · 预览版」标语 |
| 顶部信息栏 | 暗红底（与侧栏一致）；「显像管」主开关 + ▾ 设置菜单 + 「小贴士」按钮 |
| 显像管设置 | 菜单含：**刷新速度**（1-10，滚纹扫描周期 `--cz-roll-duration` = 16 - 1.4*v 秒）、**信号干扰**开关与**强度**（1-10，强度在干扰开启时可用）；菜单遮罩点击或 Esc 关闭 |
| 信号干扰 | **SVG 位移映射扭曲滤镜**（`#cz-interfere-distort`：feTurbulence 扭曲场 + feDisplacementMap，scale 由 0.8s 跳变序列驱动）——画面扭曲/撕裂，**非画面抖动**；强度变化重写位移序列（强度 1 ≈ 0.4–2.4px，强度 10 ≈ 4–24px） |
| 显像管特效 | 全屏扫描线 + RGB 荫罩 + 滚动亮纹（周期随刷新速度）+ 暗角 + 色度/对比度滤色 + 开机渐显 |
| 小贴士弹窗 | 显示「1.兵贵神速 / 2.欲速则不达 / 3.人心齐，泰山移」，点击遮罩或关闭按钮关闭 |
| 图标应用 | star.png→工作区文件夹图标；settings.png→设置入口；new.png→新建会话；新分支.png→分叉；read.png→读取类工具卡与指令控件；write.png→write/edit 工具卡；thinking/complete/error→工具卡运行中/完成/报错状态 |
| 工具卡片 | read/glob/grep/read_image/write/edit/todo_write 使用主题化黑底红边框卡片（状态图标 + 工具图标 + 参数/结果摘要） |
| 交互 | 侧栏底部「新建会话」（new.png）与会话头部「分叉」（新分支.png）动作均可直接使用 |

## 版本历史

| 版本 | 内容 |
| --- | --- |
| V1.6 (pkg-2) | **显像管设置菜单**：刷新速度（1-10，滚纹周期）与信号干扰（开关 + 强度 1-10）；**信号干扰改为 SVG 位移映射扭曲滤镜**（feTurbulence + feDisplacementMap，非画面抖动）；门控选择器升级为 `body:is(data-ds-theme, --cz-changzheng-active)`；注册冲突兼容新版 dsh 内置主题；外观行改由产品内置长征立方体承担（不再替换产品 Appearance 行） |
| V1.5 (pkg-1) | **外观栏整合四主题切换**（浅色/深色/跟随系统/长征·红星，替换产品 Appearance 行）；主题注册时序容错（修复切换按钮消失）；重建版本，含全部后续修复 |
| V1.2 | 代码块/用户消息黑红直角、工具卡/思考/上下文注入主题化、CRT 增强、新「为人民服务」横幅 |
| V1.1 (pkg-12) | **主题门控**：CSS 以 `--cz-changzheng-active` 标记变量门控，UI 随 `theme/change` 挂载/卸载；切换回浅色/深色完全还原原生主题 |
| V1 (pkg-11) | 全控件直角、设置红色、小贴士弹窗、图标全套应用、logo 112px 居中、状态文案「为人民服务中...」、蓝→红 |

## 已知限制与维护注意

1. **主题切换不持久化**：动态插件进程内状态；页面刷新后回落到持久化的主题偏好，重新在「外观」行点「长征」即可（插件本体随会话保持运行）。切换回浅色/深色时所有长征样式与 UI 自动卸载。
2. **CRT 设置为进程内状态**：主开关/刷新速度/信号干扰/强度刷新页面后恢复默认（关、5、关、4）；干扰滤镜定义随插件生命周期注入与移除。
3. **CSS-module 类名依赖**：品牌去框、hero 标语隐藏、文件夹图标替换、直角、红色控件等规则依赖产品类名中的 `_local` 段（如 `hash_brand`、`hash_folder`、`hash_titleGroup`、`hash_turnStatus`、`hash_triggerRow`、`hash_sectionHeader`、`hash_newSession`、`hash_modes`、`hash_trailing`）。目标 dsh 版本若改组件类名，相关规则静默失效——**插槽功能与主题色不受影响**，可选择性删掉失效的 CSS 行。
4. **工具卡接管**：read/glob/grep/read_image/write/edit/todo_write 的卡片被替换为极简主题卡；如需保留产品原生卡片（含 diff、图片等富内容），从 client.js 的 `tool.call.toolview` 注册段删除对应 key 即可。
5. **redo.png 未应用**：撤回/重做无可用插槽/服务 API，仅出现在设置行图览。
6. **生效范围**：红色/黑色/直角规则限定 `body[data-ds-dark-theme]`（深色面板）下生效；浅色主题下仅保留插槽注册的 UI 元素。
7. **审批**：新环境下运行 Client 代码需要用户在界面批准一次（审批策略 ask 时）。
