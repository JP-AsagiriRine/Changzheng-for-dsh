# 长征主题 changzheng V1（DeepSeek Harness Web 主题插件�?
黑红配色、长征红星图标集、显像管电视特效的动态插件包。独立于浅色/深色主题，可在「设�?�?常规 �?长征主题 · 黑红」中一键启�?停用�?
## 目录结构

```
changzheng V1/
├── host.js          # Host 半区源码（图标资源服�?RPC�?├── client.js        # Client 半区源码（主�?+ 全部界面自定义）
├── manifest.json    # 插件清单（名�?版本/图标映射/功能列表�?├── README.md        # 中文说明（本文件�?├── README_EN.md     # English
├── README_JP.md     # 日本�?├── README_Nya.md    # 喵语/meow 彩蛋
└── assets/          # 主题用到的全�?PNG 资产�?2 张）
    ├── logo.png                  # 左上角品牌徽标（112px 居中�?    ├── star.png                  # 左侧项目文件夹图�?/ CRT 按钮 / 工具卡默认图�?    ├── settings.png              # 设置入口图标
    ├── new.png                   # 新建会话入口图标
    ├── 新分�?png                 # 会话「分叉」动作图�?    ├── read.png                  # 读取类工具卡（read/glob/grep/read_image�? 指令控件图标
    ├── write.png                 # 写入/编辑工具卡（write/edit�?    ├── complete.png              # 完成�?/ todo_write 工具�?    ├── error.png                 # 报错态图�?    ├── thinking.png              # 思考�?/ hero 放射红星
    ├── serve-the-people.png      # hero「为人民服务」横�?    └── redo.png                  # 备用（暂无扩展点，展示于设置行图览）
```

## 部署到其�?dsh 环境

### 1. 放置文件

把整�?`changzheng V1` 文件夹放到目标环�?*会话工作区根目录**（例�?`D:\dsh0\changzheng V1`），保持 `assets/` �?12 �?PNG 完整�?
Host 侧按以下顺序查找图标（相对路径按会话工作区解析）�?
1. `changzheng V1/assets/`（推荐，随包自带�?2. `main-changzheng/`（兼容旧目录�?3. `D:\dsh0\main-changzheng`（开发机绝对路径兜底�?
### 2. 注册插件

�?dsh Web GUI 通过动态插件接口注册（新环境使用新的语义前缀亦可，如 `czthm`）：

```js
cordis_define({
  plugin: { kind: 'new', idPrefix: 'czthm' },
  name: '长征主题 · 显像管特�?,
  purpose: '黑红长征主题：独立主题、外观切换、logo、显像管特效与全套图标应用�?,
  code: {
    host:   host.js 全文,
    client: client.js 全文,
  },
})
```

然后 `cordis_run` 激活（首次需要用户在界面批准，审批策略为 `ask` 时弹出确认框）�?
### 3. 可选：切换主题�?
主题为注册型主题（id `changzheng`），激活插件后进入「设�?�?常规」，�?Appearance 行下方找到「长征主�?· 黑红」行，点击「启用」切换全局黑红配色，「停用」恢复深色主题�?
## 功能清单（V1.3 / 重建运行�?pkg-1�?
| 领域 | 内容 |
| --- | --- |
| 外观栏切�?| 设置 �?常规的「外观」行替换为四个立方：**浅色 / 深色 / 跟随系统 / 长征（红星）**，任何主题下可用；选中项红底金边高�?|
| 主题门控 | 样式�?UI 仅在 `changzheng` 主题激活时生效；切换回浅色/深色整体卸载，完全还原产品原生外观；外观行常�?|
| 独立主题 | 注册 `changzheng` 主题（黑�?`#0c0000`、主�?`#e60012`、金描边点缀），独立�?light/dark/system |
| 注册容错 | `theme.register` 冲突（更新时序）�?400ms 重试，避�?apply 中断导致“切换按钮消失�?|
| 全局配色 | DeepSeek 蓝色板整体重映射为红色（发送按�?链接/选中�?业务强调/设置控件），全控件红色泛光描�?|
| 造型 | 所有按钮、输入、菜单、选项卡、长框控件统一直角（`border-radius: 0`�?|
| 品牌 | 左上�?logo.png 112px 居中直贴（无外框），点击 = 新建会话；主�?hero�?28px 放射红星 + 256px「为人民服务」，隐藏原「探索未至之�?· 预览版」标�?|
| 顶部信息�?| 暗红底（与侧栏一致）；「显像管」开�?+ 「小贴士」按�?|
| 显像管特�?| 全屏扫描�?+ RGB 荫罩 + 滚动亮纹 + 暗角 + 色度/对比度滤�?+ 开机渐显；点击顶栏按钮切换 |
| 小贴士弹�?| 显示�?.兵贵神�?/ 2.欲速则不达 / 3.人心齐，泰山移」，点击遮罩或关闭按钮关�?|
| 图标应用 | star.png→工作区文件夹图标；settings.png→设置入口；new.png→新建会话；新分�?png→分叉；read.png→读取类工具卡与指令控件；write.png→write/edit 工具卡；thinking/complete/error→工具卡运行�?完成/报错状�?|
| 工具卡片 | read/glob/grep/read_image/write/edit/todo_write 使用主题化黑底红边框卡片（状态图�?+ 工具图标 + 参数/结果摘要�?|
| 交互 | 侧栏底部「新建会话」（new.png）与会话头部「分叉」（新分�?png）动作均可直接使�?|

## 版本历史

| 版本 | 内容 |
| --- | --- |
| V1.5 (pkg-1) | **外观栏整合四主题切换**（浅�?深色/跟随系统/长征·红星，替换产�?Appearance 行）；主题注册时序容错（修复切换按钮消失）；重建版本，含全部后续修复 |
| V1.2 | 代码�?用户消息黑红直角、工具卡/思�?上下文注入主题化、CRT 增强、新「为人民服务」横�?|
| V1.1 (pkg-12) | **主题门控**：CSS �?`--cz-changzheng-active` 标记变量门控，UI �?`theme/change` 挂载/卸载；切换回浅色/深色完全还原原生主题 |
| V1 (pkg-11) | 全控件直角、设置红色、小贴士弹窗、图标全套应用、logo 112px 居中、状态文案「为人民服务�?..」、蓝→红 |

## 已知限制与维护注�?
1. **主题切换不持久化**：动态插件进程内状态；页面刷新后回落到持久化的主题偏好（默�?dark/light），重新在「外观」行点「长征」即可（插件本体随会话保持运行）。切换回浅色/深色时所有长征样式与 UI 自动卸载，仅外观行保留�?2. **CSS-module 类名依赖**：品牌去框、hero 标语隐藏、文件夹图标替换、直角、红色控件等规则依赖产品类名中的 `_local` 段（�?`hash_brand`、`hash_folder`、`hash_titleGroup`、`hash_turnStatus`、`hash_triggerRow`、`hash_sectionHeader`、`hash_newSession`、`hash_modes`、`hash_trailing`）。目�?dsh 版本若改组件类名，相关规则静默失效—�?*插槽功能与主题色不受影响**，可选择性删掉失效的 CSS 行�?3. **工具卡接�?*：read/glob/grep/read_image/write/edit/todo_write 的卡片被替换为极简主题卡；如需保留产品原生卡片（含 diff、图片等富内容），从 client.js �?`tool.call.toolview` 注册段删除对�?key 即可�?4. **redo.png 未应�?*：撤�?重做无可用插�?服务 API，仅出现在设置行图览�?5. **生效范围**：红�?黑色/直角规则限定 `body[data-ds-dark-theme]`（深色面板）下生效；浅色主题下仅保留插槽注册�?UI 元素�?6. **审批**：新环境下运�?Client 代码需要用户在界面批准一次（审批策略 ask 时）�?