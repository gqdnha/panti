const questions = [
  {
    id: 1,
    type: '单选',
    content: '根据《中华人民共和国环境保护法》，下列关于环境保护税的说法正确的是：',
    options: [
      { label: 'A', content: '环境保护税的征收标准由省级人民政府确定' },
      { label: 'B', content: '环境保护税由地方税务机关征收' },
      { label: 'C', content: '环境保护税的征收对象包括噪声污染' },
      { label: 'D', content: '环境保护税的税率由国务院税务主管部门制定' }
    ],
    correctAnswer: 'B',
    analysis: '根据《中华人民共和国环境保护税法》第三条规定，环境保护税由税务机关依照本法和《中华人民共和国税收征收管理法》的规定征收管理。',
    knowledgePoints: '环境保护法、环境保护税征收管理'
  },
  {
    id: 2,
    type: '多选',
    content: '根据《中华人民共和国环境影响评价法》，下列哪些行为需要编制环境影响报告书：',
    options: [
      { label: 'A', content: '建设大型水利工程' },
      { label: 'B', content: '建设核电站' },
      { label: 'C', content: '建设小型餐饮店' },
      { label: 'D', content: '建设化工厂' }
    ],
    correctAnswer: 'ABD',
    analysis: '根据《环境影响评价法》规定，可能造成重大环境影响的项目，应当编制环境影响报告书。大型水利工程、核电站和化工厂都属于可能造成重大环境影响的项目。',
    knowledgePoints: '环境影响评价、建设项目环境管理'
  },
  {
    id: 3,
    type: '判断',
    content: '环境保护税的纳税人为直接向环境排放应税污染物的企业事业单位和其他生产经营者。',
    correctAnswer: true,
    analysis: '这个说法是正确的。根据《环境保护税法》第二条规定，在中华人民共和国领域和中华人民共和国管辖的其他海域，直接向环境排放应税污染物的企业事业单位和其他生产经营者为环境保护税的纳税人。',
    knowledgePoints: '环境保护税纳税主体'
  },
  {
    id: 4,
    type: '填空',
    content: '根据《中华人民共和国环境保护法》，制定环境质量标准和污染物排放标准，应当依据环境质量目标和国家_____发展要求。',
    correctAnswer: '经济社会',
    analysis: '根据《环境保护法》第十六条规定，制定环境质量标准和污染物排放标准，应当依据环境质量目标和国家经济社会发展要求。',
    knowledgePoints: '环境标准制定'
  },
  {
    id: 5,
    type: '单选',
    content: '关于环境行政处罚，下列说法正确的是：',
    options: [
      { label: 'A', content: '环境行政处罚只能由环保部门实施' },
      { label: 'B', content: '环境行政处罚必须先经过行政复议' },
      { label: 'C', content: '当事人对行政处罚决定不服的，可以申请行政复议或者提起行政诉讼' },
      { label: 'D', content: '环境行政处罚必须采用书面形式' }
    ],
    correctAnswer: 'C',
    analysis: '根据《行政处罚法》规定，当事人对行政处罚决定不服的，可以依法申请行政复议或者提起行政诉讼。这体现了行政相对人的权利保护。',
    knowledgePoints: '环境行政处罚、行政救济'
  }
];

module.exports = {
  questions
}; 