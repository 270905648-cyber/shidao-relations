# 师道·人际关系智库 - 工作日志

---
## Task ID: 3-a - full-stack-developer
### Work Task
实现人物档案模块的后端 API

### Work Log
- 创建了 `/api/persons/route.ts` - 实现 GET 和 POST 接口
  - GET /api/persons: 支持分页（page, pageSize）、筛选（category, priority, isActive）、搜索（name）
  - POST /api/persons: 创建新人物，验证必填字段和枚举值

- 创建了 `/api/persons/[id]/route.ts` - 实现 GET、PUT、DELETE 接口
  - GET /api/persons/[id]: 获取人物详情，包含互动记录、关系网络、困惑事件
  - PUT /api/persons/[id]: 更新人物信息，支持部分字段更新
  - DELETE /api/persons/[id]: 删除人物（级联删除关联数据）

- 创建了 `/api/persons/birthdays/route.ts` - 实现生日查询接口
  - GET /api/persons/birthdays: 支持按月份或周查询
  - 计算距离生日的天数，返回格式化的生日信息

### API 接口列表
1. **GET /api/persons** - 获取人物列表
   - Query: page, pageSize, category, priority, isActive, name
   - 返回: { success, data, pagination }

2. **POST /api/persons** - 创建新人物
   - Body: { name, category, ...其他字段 }
   - 返回: { success, data, message }

3. **GET /api/persons/[id]** - 获取人物详情
   - 返回: { success, data } (包含 interactions, relations, confusions)

4. **PUT /api/persons/[id]** - 更新人物信息
   - Body: { 要更新的字段 }
   - 返回: { success, data, message }

5. **DELETE /api/persons/[id]** - 删除人物
   - 返回: { success, message }

6. **GET /api/persons/birthdays** - 获取生日人物
   - Query: type (month/week)
   - 返回: { success, data, meta }

### Stage Summary
- 完成了所有人物档案模块的 API 接口
- 所有接口均通过 ESLint 检查
- 实现了完善的参数验证和错误处理
- 使用 Prisma ORM 进行数据库操作
- 支持级联删除和关联数据查询

---
## Task ID: 3-b - frontend-developer
### Work Task
实现能量驾驶舱前端页面

### Work Summary
实现了完整的能量驾驶舱界面 (`/home/z/my-project/src/app/page.tsx`)，包括以下功能模块：

1. **能量预算区域**
   - 进度条显示本周已用/预算时长
   - 超过80%变黄色，超过100%变红色
   - 超预算时显示能量消耗 TOP 人物

2. **今日待办区域**
   - 最多显示3条待办，按优先级排序
   - 支持生日提醒、久未联系、转介绍跟进三种类型
   - 每条待办右侧有"快速记录"按钮
   - 点击"快速记录"弹出 Dialog 可记录互动内容

3. **动态调整建议区域**
   - 显示升级/降级/超期警告三种建议
   - 提供"确认"和"忽略"按钮
   - 确认后自动更新人物优先级

4. **底部浮动按钮**
   - 语音秒记按钮
   - 手动记录按钮
   - Footer 固定在底部

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Card, Progress, Button, Dialog, Badge, Collapsible 等）
- 使用 Lucide 图标
- 响应式设计，移动端友好（max-w-md 容器）
- 不使用蓝色/靛蓝色，使用翠绿色(emerald)作为主色调
- 调用 4 个 Dashboard API 获取数据
- 所有代码通过 ESLint 检查

---
## Task ID: 4-b - frontend-developer
### Work Task
实现关系流水账前端页面

### Work Summary
实现了完整的关系流水账界面，包括以下文件：

1. **语音转文字 API** (`/api/voice/route.ts`)
   - 接收 base64 编码的音频数据
   - 调用 z-ai-web-dev-sdk 的 ASR 功能转文字
   - 返回识别的文本结果

2. **快速记录对话框** (`/components/interactions/QuickRecordDialog.tsx`)
   - 关联人物选择（下拉框）
   - 互动类型选择（11种预设类型）
   - 时长输入（分钟）
   - 主动/被动选择（RadioGroup）
   - 互动性质选择（工作必需/履职延伸/非必需社交）
   - 能量消耗评分（星星选择 1-5）
   - 备注输入（Textarea）
   - 语音输入功能（MediaRecorder API 录音 + ASR 转文字）
   - 可折叠复盘字段（明面付出、隐形收益、情绪价值、舆论跟踪、风险等级）

3. **互动记录列表** (`/components/interactions/InteractionList.tsx`)
   - 日期显示（智能显示今天/昨天）
   - 人物信息（姓名+分类标签）
   - 互动类型和主动/被动标签
   - 时长和能量消耗显示
   - 备注预览
   - 加载更多分页
   - 空状态和骨架屏

4. **互动记录页面** (`/app/interactions/page.tsx`)
   - 顶部筛选区域（人物选择、互动类型、日期范围）
   - 筛选条件标签显示和一键清除
   - 记录统计信息
   - 刷新按钮
   - 快速记录按钮

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Dialog, Select, RadioGroup, Calendar, Popover, Card, Badge 等）
- 使用 Lucide 图标
- 使用 date-fns 处理日期
- 语音录制使用 MediaRecorder API
- ASR 调用 z-ai-web-dev-sdk
- 响应式设计，移动端友好
- 不使用蓝色/靛蓝色
- 所有代码通过 ESLint 检查

---
## Task ID: 3-c - frontend-developer
### Work Task
实现人物档案前端页面

### Work Summary
实现了完整的人物档案界面，包括以下文件：

1. **人物卡片组件** (`/components/persons/PersonCard.tsx`)
   - 显示姓名、分类、优先级、上次联系时间
   - 左侧边框颜色区分优先级（红/黄/绿/灰）
   - 联系状态提示（超期警告）
   - 互动次数统计

2. **人物表单组件** (`/components/persons/PersonForm.tsx`)
   - 必填字段：姓名/代号、关系分类
   - 维护优先级默认"偶尔维护"
   - 根据分类动态显示子字段：
     - 校外家长：孩子姓名、年级、家长类型、付费能力、转介绍意愿等
     - 贫困生：家庭情况、资助记录、学业跟踪、心理状态等
     - 八卦圈：舆论影响力、可利用范围、核心驱动力
   - 可折叠的"补充信息"区域
   - 使用 Slider 组件显示评分（1-5星）

3. **人物详情组件** (`/components/persons/PersonDetail.tsx`)
   - 基本信息展示（姓名、分类、优先级、态度）
   - 联系状态（上次联系时间、建议频率）
   - 分类专用字段展示（校外家长/贫困生/八卦圈）
   - 关系网络展示（头像+姓名+关系类型）
   - 最近互动记录列表（最多10条）
   - 编辑/删除操作按钮
   - 删除确认对话框

4. **人物列表页面** (`/app/persons/page.tsx`)
   - 顶部搜索栏 + 分类筛选 + 优先级筛选
   - Tab 切换：全部 / 核心维护 / 定期维护 / 偶尔维护 / 边界维护
   - 全部视图按优先级分组显示
   - 单一优先级视图网格显示
   - 新建人物按钮
   - 点击卡片打开详情侧边栏
   - 空状态提示

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Card, Badge, Dialog, Sheet, Select, Slider, Collapsible, AlertDialog, ScrollArea, Tabs 等）
- 使用 Lucide 图标
- 使用 react-hook-form 管理表单状态
- 使用 useToast 显示操作反馈
- 响应式设计，移动端友好
- 不使用蓝色/靛蓝色，使用翠绿色(emerald)作为主色调
- 代码通过 ESLint 检查（仅有1个 React Hook Form watch 的兼容性警告，不影响功能）

---
## Task ID: 7-a - full-stack-developer
### Work Task
实现策略库与知识库模块

### Work Summary
实现了完整的策略库与知识库模块，包括后端 API 和前端页面。

#### 后端 API
1. **GET /api/strategies** - 获取策略列表
   - 支持分类筛选（测试动作/转介绍话术/能量管理/舆论利用）
   - 支持搜索（标题和内容）
   - 支持 isCustom 筛选
   - 系统预设策略排在前面，自定义策略按创建时间倒序

2. **POST /api/strategies** - 创建自定义策略
   - 验证必填字段（标题、内容、分类）
   - 验证分类和风险等级枚举值
   - 自动设置 isCustom=true

3. **GET /api/strategies/[id]** - 获取策略详情

4. **PUT /api/strategies/[id]** - 更新策略
   - 仅允许编辑 isCustom=true 的策略
   - 支持部分字段更新

5. **DELETE /api/strategies/[id]** - 删除策略
   - 仅允许删除 isCustom=true 的策略

#### 前端页面 (`/app/strategies/page.tsx`)
1. **左侧分类导航**
   - 全部策略
   - 测试动作库（火焰图标）
   - 转介绍话术库（消息图标）
   - 能量管理原则（闪电图标）
   - 舆论利用指南（广播图标）
   - 每个分类显示策略数量

2. **右侧内容展示**
   - 搜索框（搜索标题和内容）
   - 策略卡片网格布局
   - 显示标题、内容预览、适用对象、风险等级
   - 自定义策略有标识
   - 风险等级颜色区分（低/中/高）

3. **策略详情弹窗**
   - 完整显示策略内容
   - 显示分类、风险等级、适用对象
   - 自定义策略可编辑/删除
   - 系统预设策略不可修改

4. **策略表单弹窗**
   - 支持新建和编辑模式
   - 表单字段：标题、分类、内容、适用对象、风险等级
   - 必填项验证

5. **删除确认弹窗**
   - AlertDialog 确认删除操作

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Card, Dialog, AlertDialog, Badge, Select, Input, Textarea, ScrollArea 等）
- 使用 Lucide 图标
- 使用 useToast 显示操作反馈
- 响应式设计，左侧导航 + 右侧内容布局
- 不使用蓝色/靛蓝色，使用翠绿色(emerald)作为主色调
- 所有代码通过 ESLint 检查

---
## Task ID: 8-a - full-stack-developer
### Work Task
实现数据安全功能模块，包括敏感词检测、一键销毁、数据导出等功能。

### Work Summary
实现了完整的数据安全功能模块，包括后端 API、敏感词检测工具和前端设置页面。

#### 后端 API

1. **GET /api/settings** - 获取用户设置
   - 单例模式，自动创建默认设置
   - 返回周预算和数据保留天数

2. **PUT /api/settings** - 更新用户设置
   - 验证参数有效性
   - 支持部分字段更新

3. **GET /api/data/export** - 导出所有数据
   - 并行获取所有数据（Person, Interaction, Relation, Confusion, Strategy, Settings）
   - 返回 JSON 文件，带文件名和时间戳
   - 包含数据摘要统计

4. **DELETE /api/data/destroy** - 一键销毁数据
   - 二次确认参数验证（confirm: true）
   - 按正确顺序删除（考虑外键约束）
   - 返回删除统计信息
   - 保留用户设置

#### 敏感词检测工具 (`/lib/sensitive-words.ts`)

1. **敏感词分类**
   - 补课相关：补课、有偿家教、校外培训、违规补课等
   - 隐私信息：身份证号、家庭住址、电话号码、银行卡号等
   - 未成年人信息：学生全名、具体班级、学生电话等
   - 政治敏感：敏感话题

2. **正则模式检测**
   - 手机号码检测（1[3-9]\d{9}）
   - 身份证号码检测（\d{17}[\dXx]）
   - 银行卡号检测（\d{16,19}）

3. **核心函数**
   - `detectSensitiveWords(text)`: 检测文本中的敏感词，返回详细结果
   - `hasSensitiveWords(text)`: 判断是否包含敏感词
   - `getSensitiveWordList(text)`: 获取敏感词列表（去重）
   - `highlightSensitiveWords(text)`: 高亮敏感词
   - `getSensitiveWordsStats(text)`: 获取分类统计
   - `generateSensitiveWarning(text)`: 生成警告信息

#### 前端设置页面 (`/app/settings/page.tsx`)

1. **能量预算设置**
   - 周预算输入（分钟）
   - 自动换算小时显示
   - 默认 210 分钟（3.5 小时）

2. **数据管理**
   - 数据保留天数设置
   - 导出数据按钮（下载 JSON 文件）
   - 一键销毁按钮（带二次确认弹窗）
   - 红色警告提示

3. **合规提醒**
   - 显示敏感词分类标签
   - 提醒用户保护隐私

4. **操作按钮**
   - 保存设置（绿色主题）
   - 取消按钮
   - Toast 提示操作结果

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Card, Input, Label, AlertDialog, Badge, Button 等）
- 使用 Lucide 图标
- 使用 useToast 显示操作反馈
- 响应式设计，移动端友好
- 不使用蓝色/靛蓝色，使用翠绿色(emerald)作为主色调
- 所有代码通过 ESLint 检查

---
## Task ID: 6-a - full-stack-developer
### Work Task
实现困惑事件处理模块

### Work Summary
实现了完整的困惑事件处理模块，包括后端 API 和前端页面。

#### 后端 API
1. **GET /api/confusions** - 获取困惑事件列表
   - 支持分页（page, pageSize）
   - 支持状态筛选（待处理/处理中/已解决/已放弃）
   - 支持关联人物筛选（personId）
   - 按日期倒序排列
   - 返回关联人物基本信息

2. **POST /api/confusions** - 创建困惑事件
   - 必填字段：title
   - 可选字段：date, personId, description, goal, action, followUp, status
   - 验证关联人物是否存在
   - 验证状态枚举值

3. **GET /api/confusions/[id]** - 获取单条详情
   - 返回完整的困惑事件信息
   - 包含关联人物详细信息

4. **PUT /api/confusions/[id]** - 更新困惑事件
   - 支持部分字段更新
   - 验证关联人物和状态

5. **DELETE /api/confusions/[id]** - 删除困惑事件

#### 前端组件
1. **困惑卡片组件** (`/components/confusions/ConfusionCard.tsx`)
   - 显示标题、状态标签、日期、关联人物
   - 左侧边框颜色区分状态（红/黄/绿/灰）
   - 目标预览
   - 描述预览（最多2行）

2. **困惑表单组件** (`/components/confusions/ConfusionForm.tsx`)
   - 必填字段：标题
   - 日期选择（默认当天）
   - 状态选择（待处理/处理中/已解决/已放弃）
   - 关联人物选择（可选）
   - 详细描述、目标、行动、后续跟踪等字段
   - 支持新建和编辑模式

3. **困惑详情组件** (`/components/confusions/ConfusionDetail.tsx`)
   - 完整显示困惑事件信息
   - 状态流转按钮（可快速切换任意状态）
   - 快捷状态流转按钮（待处理→处理中→已解决）
   - 编辑/删除操作按钮
   - 删除确认对话框

4. **困惑列表页面** (`/app/confusion/page.tsx`)
   - 顶部搜索栏（搜索标题、描述、人物）
   - 状态筛选下拉框
   - Tab 切换：全部 / 待处理 / 处理中 / 已解决 / 已放弃
   - 每个状态显示数量统计
   - 重置筛选按钮
   - 新建困惑按钮
   - 点击卡片打开详情侧边栏
   - 空状态提示

### 状态颜色设计
- 待处理：红色（rose）
- 处理中：黄色（amber）
- 已解决：绿色（emerald）
- 已放弃：灰色（gray）

### 技术实现
- 使用 'use client' 指令实现客户端组件
- 使用 shadcn/ui 组件（Card, Dialog, Sheet, Badge, Select, AlertDialog, ScrollArea, Tabs 等）
- 使用 Lucide 图标
- 使用 useToast 显示操作反馈
- 响应式设计，移动端友好
- 不使用蓝色/靛蓝色，使用翠绿色(emerald)作为主色调
- 所有代码通过 ESLint 检查
