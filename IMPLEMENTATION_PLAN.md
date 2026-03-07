# 《师道·人际关系智库》实施方案

## 一、功能可行性分析

### ✅ 完全可实现的功能

#### 1. 核心模块（100%可实现）
| 功能模块 | 可行性 | 实现方式 |
|---------|-------|---------|
| **人物档案** | ✅ 完全支持 | Prisma + SQLite，支持所有字段类型 |
| **关系流水账** | ✅ 完全支持 | 关联查询，支持标签系统 |
| **能量驾驶舱** | ✅ 完全支持 | 实时计算，数据可视化 |
| **关系图谱** | ✅ 完全支持 | 可视化展示人物关系网络 |

#### 2. 专项功能（100%可实现）
| 功能模块 | 可行性 | 实现方式 |
|---------|-------|---------|
| 校外家长转介绍 | ✅ 完全支持 | 条件字段显示，自动提醒 |
| 贫困生长期种子 | ✅ 完全支持 | 分层管理，唤醒机制 |
| 困惑事件处理 | ✅ 完全支持 | 独立页面，状态追踪 |
| 策略库与知识库 | ✅ 完全支持 | 静态内容 + 用户自定义 |

#### 3. 数据安全功能
| 功能模块 | 可行性 | 实现方式 |
|---------|-------|---------|
| 数据库加密 | ✅ 支持 | SQLCipher 或应用层加密 |
| 本地存储 | ✅ 完全支持 | SQLite本地数据库 |
| 一键销毁 | ✅ 完全支持 | 清空数据库操作 |
| 合规预警 | ✅ 完全支持 | 关键词检测 + 提示 |
| 加密备份导出 | ✅ 支持 | 导出加密JSON文件 |

### ⚠️ 需要调整的功能

| 原功能 | 调整方案 | 原因 |
|-------|---------|------|
| FaceID/TouchID | 改用主密码 + PIN码 | Web环境限制 |
| 微信推送 | 改用浏览器通知 API | 无需微信服务号 |
| 云端自动备份 | 改为手动导出加密文件 | 隐私安全优先 |
| 语音秒记 | 使用 ASR 技能实现 | 已集成语音识别 |

---

## 二、技术架构设计

### 前端架构
```
src/
├── app/
│   ├── page.tsx                 # 首页（能量驾驶舱）
│   ├── persons/
│   │   └── page.tsx             # 人物档案列表
│   ├── interactions/
│   │   └── page.tsx             # 关系流水账
│   ├── confusion/
│   │   └── page.tsx             # 困惑事件
│   ├── strategies/
│   │   └── page.tsx             # 策略库
│   └── api/
│       ├── persons/             # 人物档案API
│       ├── interactions/        # 互动记录API
│       ├── dashboard/           # 驾驶舱数据API
│       ├── confusion/           # 困惑事件API
│       └── voice/               # 语音转文字API
├── components/
│   ├── ui/                      # shadcn/ui 组件
│   ├── dashboard/               # 驾驶舱组件
│   ├── persons/                 # 人物相关组件
│   └── interactions/            # 互动记录组件
└── lib/
    ├── db.ts                    # 数据库客户端
    ├── encryption.ts            # 加密工具
    └── utils.ts                 # 工具函数
```

### 数据库设计（Prisma Schema）

```prisma
// 核心表结构
model Person {
  id                    String   @id @default(cuid())
  name                  String                    // 姓名/代号
  category              String                    // 关系分类
  priority              String   @default("偶尔维护") // 维护优先级
  
  // 可选补充字段
  subCategory           String?                   // 子分类
  circles               String?                   // 关联圈子（JSON数组）
  energyCost            Int?                      // 主动联系能量成本 1-5
  passiveBurden         Int?                      // 被动联系负担 1-5
  influencePower        Int?                      // 舆论影响力 1-5
  usableScope           String?                   // 可利用范围（JSON数组）
  coreDriver            String?                   // 核心驱动力（JSON数组）
  currentNeed           String?                   // 近期需求/软肋
  riskLine              String?                   // 风险红线
  birthday              DateTime?                 // 生日
  familyInfo            String?                   // 家庭情况
  contactFrequency      Int?                      // 建议联系频率（天）
  intimacy              Int?                      // 关系亲密度 1-10
  attitude              String?                   // 对方当前态度
  
  // 校外家长专用字段
  childName             String?
  childGrade            String?
  childStudyStatus      String?
  parentType            String?
  payAbility            Int?
  referralWillingness   Int?
  referralCount         Int       @default(0)
  potentialReferrals    String?
  
  // 贫困生专用字段
  familySituation       String?
  aidRecords            String?
  academicTracking      String?
  mentalState           String?
  futurePotential       String?
  graduationDestination String?
  isActive              Boolean  @default(true)
  wakeupCycle           String?                   // 唤醒周期
  
  // 系统字段
  lastContactDate       DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  interactions          Interaction[]
  relationsAsPerson1    Relation[] @relation("Person1Relations")
  relationsAsPerson2    Relation[] @relation("Person2Relations")
  confusions            Confusion[]
}

model Interaction {
  id                    String   @id @default(cuid())
  personId              String
  person                Person   @relation(fields: [personId], references: [id])
  
  date                  DateTime @default(now())
  type                  String                    // 互动类型
  duration              Int?                      // 互动时长（分钟）
  initiative            String                    // 主动/被动
  nature                String                    // 互动性质
  countToBudget         Boolean  @default(true)
  energyScore           Int?                      // 能量消耗评分
  tags                  String?                   // 标签（JSON数组）
  note                  String?                   // 备注
  
  // 复盘字段
  surfaceCost           String?                   // 明面付出
  hiddenGain            String?                   // 隐形收益
  emotionValue          Int?                      // 对方情绪价值
  spreadTracking        String?                   // 舆论传播跟踪
  riskLevel             String?                   // 风险等级
  
  createdAt             DateTime @default(now())
}

model Relation {
  id                    String   @id @default(cuid())
  person1Id             String
  person2Id             String
  person1               Person   @relation("Person1Relations", fields: [person1Id], references: [id])
  person2               Person   @relation("Person2Relations", fields: [person2Id], references: [id])
  type                  String                    // 关系类型：盟友/对立/上下级/同学/亲戚
  intimacy              Int?                      // 亲密度
  note                  String?
  createdAt             DateTime @default(now())
}

model Confusion {
  id                    String   @id @default(cuid())
  title                 String
  date                  DateTime @default(now())
  personId              String?
  person                Person?  @relation(fields: [personId], references: [id])
  description           String?
  goal                  String?
  action                String?
  followUp              String?
  status                String   @default("待处理")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Strategy {
  id                    String   @id @default(cuid())
  category              String                    // 分类：测试动作/转介绍话术/能量管理/舆论利用
  title                 String
  content               String
  targetType            String?                   // 适用人物类型
  riskLevel             String?                   // 风险等级
  isCustom              Boolean  @default(false)  // 是否用户自定义
  createdAt             DateTime @default(now())
}

model UserSettings {
  id                    String   @id @default(cuid())
  weeklyBudget          Int      @default(210)    // 周预算（分钟）
  dataRetentionDays     Int      @default(365)    // 数据保留天数
  masterPassword        String?                   // 主密码哈希
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## 三、功能模块实现计划

### 阶段一：核心基础（第1-2天）
1. **数据库初始化**
   - 创建 Prisma Schema
   - 运行数据库迁移
   - 初始化策略库数据

2. **人物档案模块**
   - 人物列表页
   - 新建/编辑表单
   - 人物详情页
   - 关系图谱展示

3. **关系流水账模块**
   - 互动记录列表
   - 快速记录表单
   - 语音输入集成

### 阶段二：智能驾驶舱（第3天）
1. **能量驾驶舱**
   - 周预算进度条
   - 今日待办列表
   - 动态调整提醒
   - 数据看板

2. **预警系统**
   - 生日提醒
   - 长期未联系预警
   - 超预算警告
   - 关系调整建议

### 阶段三：专项功能（第4天）
1. **校外家长转介绍**
   - 条件字段显示
   - 转介绍跟进
   - 开口提醒

2. **贫困生长期种子**
   - 毕业后转入种子库
   - 自定义唤醒周期

3. **困惑事件处理**
   - 独立管理页面
   - 状态流转

### 阶段四：安全与优化（第5天）
1. **数据安全**
   - 敏感字段加密
   - 合规关键词检测
   - 一键销毁功能

2. **数据管理**
   - 加密备份导出
   - 数据导入
   - 自动清理设置

---

## 四、关键交互设计

### 1. 首页（能量驾驶舱）
```
┌────────────────────────────────────────┐
│  🔋 本周能量预算                         │
│  ████████░░░░ 140/210 分钟 (67%)        │
│  [查看详情]                             │
├────────────────────────────────────────┤
│  📋 今日待办                            │
│  ├─ 🎂 张校长今天生日         [快速记录] │
│  ├─ ⏰ 李家长超过30天未联系    [快速记录] │
│  └─ 📞 王同学转介绍跟进       [快速记录] │
│     [还有3项其他提醒 ▼]                 │
├────────────────────────────────────────┤
│  💡 动态调整建议                        │
│  张三连续3次互动情绪价值≥4星            │
│  建议升级为定期维护  [确认] [忽略]       │
├────────────────────────────────────────┤
│  [🎤 语音秒记]  [📝 手动记录]            │
└────────────────────────────────────────┘
```

### 2. 人物档案
```
┌────────────────────────────────────────┐
│  👤 人物档案                    [+新建] │
├────────────────────────────────────────┤
│  🔍 搜索...    [分类筛选 ▼] [层级筛选 ▼]│
├────────────────────────────────────────┤
│  ┌─────────┐ 核心维护                   │
│  │ 👤 张校长 │ ● 上次联系: 3天前         │
│  │ 领导     │ ● 建议频率: 每7天          │
│  └─────────┘                           │
│  ┌─────────┐ 定期维护                   │
│  │ 👤 李老师 │ ● 上次联系: 10天前        │
│  │ 同事     │ ● 建议频率: 每14天         │
│  └─────────┘                           │
└────────────────────────────────────────┘
```

### 3. 快速记录
```
┌────────────────────────────────────────┐
│  📝 快速记录互动                        │
├────────────────────────────────────────┤
│  关联人物: [选择人物 ▼]                 │
│  互动类型: [办公室聊天 ▼]               │
│  时长: [30] 分钟                        │
│  主动/被动: ○ 主动  ● 被动              │
│  能量消耗: ⭐⭐⭐☆☆                      │
│  备注: __________________________      │
│        [🎤 语音输入]                    │
│                                        │
│  [展开复盘字段 ▼]                       │
│                                        │
│  [取消]              [保存]            │
└────────────────────────────────────────┘
```

---

## 五、技术亮点

### 1. 语音秒记功能
- 集成 ASR（语音识别）技能
- 支持一键语音转文字
- 自动填充备注字段

### 2. 智能预警系统
- 基于规则的提醒机制
- 动态关系调整建议
- 预算超支预警

### 3. 数据安全
- 敏感字段应用层加密
- 一键销毁功能
- 合规关键词检测

### 4. 离线优先
- 所有数据本地存储
- 无需网络即可使用
- 手动备份机制

---

## 六、开发优先级

### P0 - 必须实现
- [x] 人物档案 CRUD
- [x] 关系流水账记录
- [x] 能量驾驶舱核心数据
- [x] 语音输入功能
- [x] 基础预警系统

### P1 - 重要功能
- [ ] 关系图谱可视化
- [ ] 动态调整建议
- [ ] 转介绍管理
- [ ] 贫困生种子库

### P2 - 增强功能
- [ ] 数据加密
- [ ] 备份导出
- [ ] 合规预警
- [ ] 策略库管理

---

## 七、总结

本项目的所有核心功能都可以在 Next.js + Prisma + SQLite 技术栈下实现。主要调整点在于：

1. **身份验证**：用主密码替代生物识别
2. **推送通知**：用浏览器通知替代微信推送
3. **云备份**：用手动导出替代自动云同步

这些调整不影响核心功能的完整性，反而更好地保护了用户隐私。项目整体可行性为 **95%+**。
