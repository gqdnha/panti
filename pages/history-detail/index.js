Page({
  data: {
    record: null,
    questions: []
  },

  onLoad(options) {
    const { id } = options;
    this.getRecordDetail(id);
  },

  getRecordDetail(id) {
    // 模拟答题记录数据
    const record = {
      id: 1,
      title: 'JavaScript基础测试',
      time: '2024-03-20 14:30',
      questionCount: 20,
      correctRate: 85,
      duration: 30,
      category: '前端开发',
      difficulty: '中等'
    };

    // 模拟题目数据
    const questions = [
      {
        id: 1,
        type: '单选题',
        content: '以下哪个是JavaScript的基本数据类型？',
        options: ['Array', 'Object', 'String', 'Function'],
        userAnswer: 'String',
        correctAnswer: 'String',
        isCorrect: true,
        explanation: 'JavaScript的基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol。'
      },
      {
        id: 2,
        type: '多选题',
        content: '以下哪些是前端框架？',
        options: ['React', 'Vue', 'Angular', 'jQuery'],
        userAnswer: 'React, Vue',
        correctAnswer: 'React, Vue, Angular',
        isCorrect: false,
        explanation: 'React、Vue和Angular都是主流的前端框架，jQuery是一个JavaScript库。'
      },
      {
        id: 3,
        type: '判断题',
        content: 'JavaScript是一种强类型语言。',
        options: ['正确', '错误'],
        userAnswer: '错误',
        correctAnswer: '错误',
        isCorrect: true,
        explanation: 'JavaScript是一种弱类型语言，变量可以随时改变类型。'
      },
      {
        id: 4,
        type: '简答题',
        content: '请简述Vue的生命周期钩子函数。',
        userAnswer: 'Vue的生命周期钩子函数包括：beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeDestroy、destroyed。',
        correctAnswer: 'Vue的生命周期钩子函数包括：beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeDestroy、destroyed。',
        isCorrect: true,
        explanation: 'Vue的生命周期钩子函数是Vue实例在创建、挂载、更新和销毁过程中会自动调用的函数。'
      },
      {
        id: 5,
        type: '单选题',
        content: '以下哪个不是React的生命周期方法？',
        options: ['componentDidMount', 'componentWillUnmount', 'componentDidUpdate', 'componentWillUpdate'],
        userAnswer: 'componentWillUpdate',
        correctAnswer: 'componentWillUpdate',
        isCorrect: true,
        explanation: 'componentWillUpdate是React的生命周期方法，用于在组件更新前执行。'
      },
      {
        id: 6,
        type: '多选题',
        content: '以下哪些是ES6的新特性？',
        options: ['let和const', '箭头函数', '解构赋值', 'Promise'],
        userAnswer: 'let和const, 箭头函数',
        correctAnswer: 'let和const, 箭头函数, 解构赋值, Promise',
        isCorrect: false,
        explanation: 'ES6引入了许多新特性，包括let和const声明、箭头函数、解构赋值、Promise等。'
      },
      {
        id: 7,
        type: '判断题',
        content: 'CSS中，position: fixed是相对于最近的定位祖先元素进行定位。',
        options: ['正确', '错误'],
        userAnswer: '错误',
        correctAnswer: '错误',
        isCorrect: true,
        explanation: 'position: fixed是相对于视口进行定位，而不是相对于最近的定位祖先元素。'
      },
      {
        id: 8,
        type: '简答题',
        content: '请解释什么是闭包，并举例说明。',
        userAnswer: '闭包是指有权访问另一个函数作用域中的变量的函数。例如：function outer() { let x = 1; return function() { return x; } }',
        correctAnswer: '闭包是指有权访问另一个函数作用域中的变量的函数。例如：function outer() { let x = 1; return function() { return x; } }',
        isCorrect: true,
        explanation: '闭包是JavaScript中一个重要的概念，它允许函数访问并操作函数外部的变量。'
      }
    ];

    this.setData({
      record,
      questions
    });
  },

  shareResult() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  retryQuestion() {
    wx.showModal({
      title: '提示',
      content: '确定要重新答题吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/question/index?id=${this.data.record.id}`
          });
        }
      }
    });
  },

  onShareAppMessage() {
    const { record } = this.data;
    return {
      title: `我在${record.title}中获得了${record.correctRate}%的正确率！`,
      path: `/pages/history-detail/index?id=${record.id}`
    };
  }
}); 