const categories = [
  {
    id: 1,
    name: '法律法规',
    questions: [1, 3, 5], // 关联的题目ID
    description: '环境保护相关法律法规题目'
  },
  {
    id: 2,
    name: '规章办法',
    questions: [2], // 关联的题目ID
    description: '环境保护相关规章办法题目'
  },
  {
    id: 3,
    name: '标准规范',
    questions: [4], // 关联的题目ID
    description: '环境保护相关标准规范题目'
  },
  {
    id: 4,
    name: '政策制度',
    questions: [], // 暂无题目
    description: '环境保护相关政策制度题目'
  },
  {
    id: 5,
    name: '其他',
    questions: [], // 暂无题目
    description: '其他相关题目'
  }
];

// 题目难度等级
const difficultyLevels = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难'
};

// 知识点分类
const knowledgePoints = {
  ENVIRONMENTAL_LAW: '环境保护法',
  ENVIRONMENTAL_TAX: '环境保护税',
  ENVIRONMENTAL_ASSESSMENT: '环境影响评价',
  ENVIRONMENTAL_STANDARDS: '环境标准',
  ENVIRONMENTAL_PUNISHMENT: '环境行政处罚'
};

module.exports = {
  categories,
  difficultyLevels,
  knowledgePoints
}; 