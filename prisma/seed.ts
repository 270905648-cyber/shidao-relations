import { db } from '../src/lib/db';

// 策略库种子数据
const strategies = [
  // 测试动作库
  {
    category: '测试动作',
    title: '借钱测试',
    content: '以小额紧急为由向对方借钱，观察反应速度和态度。借后及时归还并表示感谢。\n\n正面反应：愿意帮助，不推诿 → 关系较好，值得深交\n中性反应：犹豫后同意 → 正常社交距离\n负面反应：找借口拒绝或态度冷淡 → 关系一般或对方谨慎',
    targetType: '同事/朋友/亲戚',
    riskLevel: '中风险',
    isCustom: false,
  },
  {
    category: '测试动作',
    title: '信息共享测试',
    content: '主动分享一条有价值但非核心的信息（如某个机会、某个消息），观察对方是否会回馈信息。\n\n单方面索取不回馈的人，建议调整为边界维护。',
    targetType: '同事/家长',
    riskLevel: '低风险',
    isCustom: false,
  },
  {
    category: '测试动作',
    title: '忙时求助测试',
    content: '在自己明显忙碌时，向对方提出一个小的帮忙请求，观察对方是否体谅或主动分担。\n\n注意：不要用此测试领导或关键关系。',
    targetType: '平级同事',
    riskLevel: '中风险',
    isCustom: false,
  },
  {
    category: '测试动作',
    title: '情绪支持测试',
    content: '适度表达负面情绪或困难，观察对方的反应。真心的人会给予安慰和建议，虚情假意的人会敷衍或传播。',
    targetType: '八卦圈/同事',
    riskLevel: '高风险',
    isCustom: false,
  },

  // 转介绍话术库
  {
    category: '转介绍话术',
    title: '成绩提升切入',
    content: '"家长您好，最近孩子数学成绩进步明显，进步这么大，肯定是家庭教育做得好。不知道您身边有没有朋友的孩子也需要提分？我这边精力有限，但如果有靠谱的家长朋友，我可以优先安排。"',
    targetType: '潜在大客户',
    riskLevel: '低风险',
    isCustom: false,
  },
  {
    category: '转介绍话术',
    title: '满意度确认切入',
    content: '"孩子这学期跟着我学习，您感觉效果怎么样？如果觉得还不错的话，身边有需要的朋友可以推荐一下，成功的话我这边可以给您孩子安排几节免费复习课作为感谢。"',
    targetType: '普通家长',
    riskLevel: '低风险',
    isCustom: false,
  },
  {
    category: '转介绍话术',
    title: '稀缺资源切入',
    content: '"最近想让孩子跟着我学的家长比较多，但我这边精力有限，只能带几个。您是我最信任的家长之一，如果您有朋友的孩子想学，可以优先安排，毕竟是您介绍的我放心。"',
    targetType: '转介绍核心',
    riskLevel: '低风险',
    isCustom: false,
  },
  {
    category: '转介绍话术',
    title: '共同进步切入',
    content: '"我发现孩子最近学习状态特别好，如果有同龄人一起学效果会更好。您看有没有朋友的孩子成绩差不多、学习习惯也好的，可以一起组个小班，费用也能优惠一些。"',
    targetType: '普通家长',
    riskLevel: '低风险',
    isCustom: false,
  },

  // 社交能量管理原则
  {
    category: '能量管理',
    title: '社交能量预算原则',
    content: '【核心原则】\n1. 每周主动社交时间设弹性预算（建议210分钟=3.5小时）\n2. 工作必需社交不计入预算\n3. 非必需社交计入预算，超预算仅提醒不强制\n\n【分层策略】\n- 核心维护：每周主动联系1次，重要节日必到\n- 定期维护：每两周主动联系1次\n- 偶尔维护：每月主动联系1次或仅被动回应\n- 边界维护：能不联系就不联系，礼貌距离',
    targetType: '所有',
    riskLevel: null,
    isCustom: false,
  },
  {
    category: '能量管理',
    title: '被动社交优先策略',
    content: '【专业锚点】\n建立"数学教学专家"标签，让别人有数学问题主动找你\n\n【资源节点】\n成为信息、机会、资源的中间人，让人需要通过你获取资源\n\n【社交引力】\n- 公开场合分享专业见解\n- 适度展示教学成果\n- 在关键圈子保持存在感\n\n【效果】\n被动社交越多，主动社交需求越少，能量消耗越低',
    targetType: '所有',
    riskLevel: null,
    isCustom: false,
  },
  {
    category: '能量管理',
    title: '八卦圈应对策略',
    content: '【原则】\n只听不说，点头微笑，不表态，不站队\n\n【舆论先锋利用】\n可主动分享以下信息让其传播：\n- 个人公开荣誉（评优、获奖）\n- 教学成果（学生进步案例）\n- 公开课信息\n\n【禁止传播信息】\n- 个人隐私\n- 同事评价\n- 领导看法\n- 家庭情况',
    targetType: '八卦圈',
    riskLevel: null,
    isCustom: false,
  },

  // 舆论利用指南
  {
    category: '舆论利用',
    title: '舆论先锋识别标准',
    content: '【高价值舆论先锋特征】\n1. 传播速度快：消息一天内能传遍整个圈子\n2. 传播范围广：跨部门、跨年级都有人脉\n3. 信息相对准确：不经常造谣\n4. 对你态度友善：愿意帮你说话\n\n【使用原则】\n- 只传播你想公开的信息\n- 不透露任何负面信息\n- 偶尔"不经意"透露正面消息\n- 维护好关系但保持距离',
    targetType: '八卦圈',
    riskLevel: null,
    isCustom: false,
  },
  {
    category: '舆论利用',
    title: '负面舆论应对',
    content: '【原则】\n1. 不辩解、不回应、不传播\n2. 找机会展示正面形象\n3. 让舆论先锋帮你"澄清"\n\n【话术示例】\n"这事我听说了，挺无奈的。不过您说得对，清者自清，我还是把心思放在教学上吧。"\n\n【注意】\n如果是原则性问题，需要主动澄清；如果是小道消息，沉默是最好的回应。',
    targetType: '所有',
    riskLevel: null,
    isCustom: false,
  },
];

async function main() {
  console.log('开始初始化策略库数据...');

  // 检查是否已有数据
  const existing = await db.strategy.count();
  if (existing > 0) {
    console.log('策略库已有数据，跳过初始化');
    return;
  }

  // 插入策略数据
  for (const strategy of strategies) {
    await db.strategy.create({
      data: strategy,
    });
  }

  console.log(`成功插入 ${strategies.length} 条策略数据`);

  // 初始化用户设置
  const settingsExist = await db.userSettings.count();
  if (settingsExist === 0) {
    await db.userSettings.create({
      data: {
        weeklyBudget: 210,
        dataRetentionDays: 365,
      },
    });
    console.log('成功初始化用户设置');
  }
}

main()
  .catch((e) => {
    console.error('初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
