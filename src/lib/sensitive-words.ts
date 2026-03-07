/**
 * 敏感词检测工具
 * 用于检测文本中可能存在的敏感信息，提醒用户注意数据安全
 */

// 敏感词分类
export const sensitiveWordCategories = {
  // 补课相关 - 教育行业敏感词
  tutoring: {
    name: '补课相关',
    words: ['补课', '有偿家教', '校外培训', '违规补课', '私下补课', '有偿补课', '家教服务', '培训收费'],
  },
  // 隐私信息 - 个人敏感信息
  privacy: {
    name: '隐私信息',
    words: ['身份证号', '身份证', '家庭住址', '住址', '电话号码', '手机号', '银行卡号', '银行卡', '支付宝账号', '微信支付'],
  },
  // 未成年人信息
  minors: {
    name: '未成年人信息',
    words: ['学生全名', '具体班级', '学生电话', '家长电话', '家庭收入'],
  },
  // 政治敏感
  political: {
    name: '政治敏感',
    words: ['政治敏感', '反动', '敏感话题'],
  },
} as const;

// 所有敏感词列表（扁平化）
export const sensitiveWords: string[] = Object.values(sensitiveWordCategories).flatMap(
  (category) => category.words
);

// 特殊模式检测（正则表达式）
const sensitivePatterns = [
  {
    name: '手机号码',
    pattern: /1[3-9]\d{9}/g,
    description: '检测到可能的手机号码',
  },
  {
    name: '身份证号码',
    pattern: /\d{17}[\dXx]/g,
    description: '检测到可能的身份证号码',
  },
  {
    name: '银行卡号',
    pattern: /\d{16,19}/g,
    description: '检测到可能的银行卡号',
  },
];

// 检测结果类型
export interface SensitiveWordResult {
  word: string;
  category: string;
  position: number;
  isPattern?: boolean;
  description?: string;
}

/**
 * 检测文本中的敏感词
 * @param text 要检测的文本
 * @returns 检测到的敏感词数组
 */
export function detectSensitiveWords(text: string): SensitiveWordResult[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const results: SensitiveWordResult[] = [];

  // 检测关键词
  for (const [categoryKey, category] of Object.entries(sensitiveWordCategories)) {
    for (const word of category.words) {
      let position = text.indexOf(word);
      while (position !== -1) {
        results.push({
          word,
          category: category.name,
          position,
        });
        position = text.indexOf(word, position + 1);
      }
    }
  }

  // 检测正则模式
  for (const pattern of sensitivePatterns) {
    const matches = text.matchAll(pattern.pattern);
    for (const match of matches) {
      // 排除已检测到的银行卡号重复（数字序列可能被银行卡号模式匹配）
      const isDuplicate = results.some(
        (r) => r.position === match.index && r.word === match[0]
      );
      if (!isDuplicate) {
        results.push({
          word: match[0],
          category: '隐私信息',
          position: match.index ?? 0,
          isPattern: true,
          description: pattern.description,
        });
      }
    }
  }

  // 按位置排序
  return results.sort((a, b) => a.position - b.position);
}

/**
 * 检测文本中是否包含敏感词
 * @param text 要检测的文本
 * @returns 是否包含敏感词
 */
export function hasSensitiveWords(text: string): boolean {
  return detectSensitiveWords(text).length > 0;
}

/**
 * 获取文本中所有敏感词的简单列表（去重）
 * @param text 要检测的文本
 * @returns 敏感词数组
 */
export function getSensitiveWordList(text: string): string[] {
  const results = detectSensitiveWords(text);
  const uniqueWords = new Set(results.map((r) => r.word));
  return Array.from(uniqueWords);
}

/**
 * 高亮文本中的敏感词
 * @param text 原始文本
 * @param highlightChar 高亮字符（默认使用 ** 包裹）
 * @returns 高亮后的文本
 */
export function highlightSensitiveWords(
  text: string,
  highlightChar: string = '**'
): string {
  const results = detectSensitiveWords(text);
  if (results.length === 0) {
    return text;
  }

  // 从后往前替换，避免位置偏移
  const sortedResults = [...results].sort((a, b) => b.position - a.position);
  let highlightedText = text;

  for (const result of sortedResults) {
    const start = result.position;
    const end = start + result.word.length;
    highlightedText =
      highlightedText.slice(0, start) +
      highlightChar +
      highlightedText.slice(start, end) +
      highlightChar +
      highlightedText.slice(end);
  }

  return highlightedText;
}

/**
 * 获取敏感词分类统计
 * @param text 要检测的文本
 * @returns 按分类统计的敏感词数量
 */
export function getSensitiveWordsStats(
  text: string
): Record<string, { name: string; count: number; words: string[] }> {
  const results = detectSensitiveWords(text);
  const stats: Record<string, { name: string; count: number; words: string[] }> = {};

  for (const result of results) {
    if (!stats[result.category]) {
      stats[result.category] = {
        name: result.category,
        count: 0,
        words: [],
      };
    }
    stats[result.category].count++;
    if (!stats[result.category].words.includes(result.word)) {
      stats[result.category].words.push(result.word);
    }
  }

  return stats;
}

/**
 * 生成敏感词警告信息
 * @param text 要检测的文本
 * @returns 警告信息（如果没有敏感词则返回 null）
 */
export function generateSensitiveWarning(text: string): string | null {
  const results = detectSensitiveWords(text);
  if (results.length === 0) {
    return null;
  }

  const stats = getSensitiveWordsStats(text);
  const warnings: string[] = ['检测到以下敏感信息：'];

  for (const [, stat] of Object.entries(stats)) {
    warnings.push(`- ${stat.name}：${stat.words.join('、')}`);
  }

  warnings.push('\n请注意保护个人隐私，避免记录敏感信息。');

  return warnings.join('\n');
}
