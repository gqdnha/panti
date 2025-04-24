// 模拟统计数据
const mockStats = {
  // 月度统计数据
  monthlyStats: {
    '2024-03': {
      totalTime: 1200,
      correctRate: 85,
      wrongCount: 45,
      dailyStats: {
        '2024-03-01': { correctRate: 82, time: 45 },
        '2024-03-02': { correctRate: 85, time: 60 },
        '2024-03-03': { correctRate: 88, time: 30 },
        '2024-03-04': { correctRate: 83, time: 50 },
        '2024-03-05': { correctRate: 86, time: 40 },
        '2024-03-06': { correctRate: 84, time: 55 },
        '2024-03-07': { correctRate: 87, time: 35 }
      }
    },
    '2024-02': {
      totalTime: 1500,
      correctRate: 82,
      wrongCount: 50,
      dailyStats: {
        '2024-02-01': { correctRate: 80, time: 50 },
        '2024-02-02': { correctRate: 83, time: 45 },
        '2024-02-03': { correctRate: 85, time: 40 },
        '2024-02-04': { correctRate: 81, time: 55 },
        '2024-02-05': { correctRate: 84, time: 35 },
        '2024-02-06': { correctRate: 82, time: 50 },
        '2024-02-07': { correctRate: 86, time: 30 }
      }
    }
  },

  // 错题本数据
  wrongQuestions: [
    {
      id: 1,
      type: '单选题',
      content: '《中华人民共和国环境保护法》规定，环境保护坚持保护优先、预防为主、综合治理、公众参与、损害担责的原则。',
      knowledgePoint: '环境保护法',
      correctCount: 1,
      lastWrongTime: '2024-03-20',
      options: [
        '正确',
        '错误'
      ],
      correctAnswer: 0,
      explanation: '《中华人民共和国环境保护法》第五条规定了环境保护的基本原则。'
    },
    {
      id: 2,
      type: '多选题',
      content: '下列哪些行为属于环境违法行为？',
      knowledgePoint: '环境保护法',
      correctCount: 0,
      lastWrongTime: '2024-03-19',
      options: [
        '未依法取得排污许可证排放污染物',
        '超过污染物排放标准排放污染物',
        '通过暗管、渗井、渗坑、灌注等方式排放污染物',
        '篡改、伪造监测数据'
      ],
      correctAnswer: [0, 1, 2, 3],
      explanation: '根据《环境保护法》第六十三条规定，以上行为都属于环境违法行为。'
    },
    {
      id: 3,
      type: '判断题',
      content: '环境影响评价文件未经审批，建设项目不得开工建设。',
      knowledgePoint: '环境影响评价',
      correctCount: 2,
      lastWrongTime: '2024-03-18',
      options: [
        '正确',
        '错误'
      ],
      correctAnswer: 0,
      explanation: '根据《环境影响评价法》第二十五条规定，建设项目的环境影响评价文件未经审批，不得开工建设。'
    },
    {
      id: 4,
      type: '单选题',
      content: '根据《环境空气质量标准》（GB 3095-2012），PM2.5的24小时平均浓度限值是多少？',
      knowledgePoint: '环境标准',
      correctCount: 1,
      lastWrongTime: '2024-03-17',
      options: [
        '35μg/m³',
        '50μg/m³',
        '75μg/m³',
        '100μg/m³'
      ],
      correctAnswer: 2,
      explanation: '根据《环境空气质量标准》（GB 3095-2012）规定，PM2.5的24小时平均浓度限值为75μg/m³。'
    }
  ],

  // 知识点分类
  knowledgePoints: [
    '环境保护法',
    '环境保护税',
    '环境影响评价',
    '环境标准',
    '环境行政处罚'
  ],

  // 题型分类
  questionTypes: [
    '单选题',
    '多选题',
    '判断题',
    '简答题',
    '案例分析题'
  ]
};

module.exports = {
  mockStats
}; 