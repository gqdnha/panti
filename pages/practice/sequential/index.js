const { questions } = require('../../../data/questions.js');

Page({
  data: {
    currentQuestion: 1,
    totalQuestions: questions.length,
    usedTime: 0,
    startTime: 0,
    currentQuestionData: null,
    answer: '',
    showAnalysis: false,
    isCorrect: false,
    timer: null,
    questions: questions
  },

  onLoad: function() {
    this.setData({
      startTime: Date.now()
    });
    this.startTimer();
    this.loadQuestion(this.data.currentQuestion);
  },

  onUnload: function() {
    this.clearTimer();
  },

  // 开始计时器
  startTimer: function() {
    this.clearTimer();
    this.data.timer = setInterval(() => {
      const now = Date.now();
      const usedTime = Math.floor((now - this.data.startTime) / 60000); // 转换为分钟
      this.setData({
        usedTime
      });
    }, 1000);
  },

  // 清除计时器
  clearTimer: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 加载题目
  loadQuestion: function(questionIndex) {
    const question = this.data.questions[questionIndex - 1];
    if (question) {
      // 为选项添加selected属性
      if (question.options) {
        question.options = question.options.map(option => ({
          ...option,
          selected: false
        }));
      }
      
      this.setData({
        currentQuestionData: question,
        answer: ''
      });
    }
  },

  // 选择单选题选项
  selectOption: function(e) {
    const index = e.currentTarget.dataset.index;
    const options = this.data.currentQuestionData.options.map((item, i) => {
      return {
        ...item,
        selected: i === index
      };
    });

    this.setData({
      'currentQuestionData.options': options,
      answer: options[index].label
    });
  },

  // 选择多选题选项
  selectMultipleOption: function(e) {
    const index = e.currentTarget.dataset.index;
    const options = this.data.currentQuestionData.options.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          selected: !item.selected
        };
      }
      return item;
    });

    const selectedOptions = options
      .filter(item => item.selected)
      .map(item => item.label)
      .join('');

    this.setData({
      'currentQuestionData.options': options,
      answer: selectedOptions
    });
  },

  // 选择判断题答案
  selectJudge: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      answer: value
    });
  },

  // 填空题输入答案
  onInputAnswer: function(e) {
    this.setData({
      answer: e.detail.value
    });
  },

  // 提交答案
  submitAnswer: function() {
    if (!this.data.answer && this.data.answer !== false) {
      wx.showToast({
        title: '请选择或输入答案',
        icon: 'none'
      });
      return;
    }

    // 检查答案是否正确
    const isCorrect = this.checkAnswer();
    
    // 保存答题记录
    this.saveAnswerRecord(isCorrect);

    this.setData({
      showAnalysis: true,
      isCorrect
    });
  },

  // 检查答案是否正确
  checkAnswer: function() {
    const { currentQuestionData, answer } = this.data;
    
    if (currentQuestionData.type === '判断') {
      return answer === currentQuestionData.correctAnswer;
    } else if (currentQuestionData.type === '多选') {
      // 对多选题答案进行排序后比较
      const sortedAnswer = answer.split('').sort().join('');
      const sortedCorrectAnswer = currentQuestionData.correctAnswer.split('').sort().join('');
      return sortedAnswer === sortedCorrectAnswer;
    } else {
      return answer === currentQuestionData.correctAnswer;
    }
  },

  // 保存答题记录
  saveAnswerRecord: function(isCorrect) {
    const record = {
      questionId: this.data.currentQuestionData.id,
      answer: this.data.answer,
      isCorrect,
      usedTime: this.data.usedTime,
      timestamp: Date.now()
    };

    // 保存到本地存储
    const records = wx.getStorageSync('answerRecords') || [];
    records.push(record);
    wx.setStorageSync('answerRecords', records);

    // 如果答错了，加入错题本
    if (!isCorrect) {
      const wrongQuestions = wx.getStorageSync('wrongQuestions') || [];
      wrongQuestions.push(this.data.currentQuestionData);
      wx.setStorageSync('wrongQuestions', wrongQuestions);
    }
  },

  // 关闭解析弹窗
  closeAnalysis: function() {
    this.setData({
      showAnalysis: false
    });
  },

  // 加入错题本
  addToWrongBook: function() {
    const wrongQuestions = wx.getStorageSync('wrongQuestions') || [];
    const exists = wrongQuestions.some(q => q.id === this.data.currentQuestionData.id);
    
    if (!exists) {
      wrongQuestions.push(this.data.currentQuestionData);
      wx.setStorageSync('wrongQuestions', wrongQuestions);
      wx.showToast({
        title: '已加入错题本',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '已在错题本中',
        icon: 'none'
      });
    }
  },

  // 上一题
  prevQuestion: function() {
    if (this.data.currentQuestion > 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion - 1,
        answer: '',
        showAnalysis: false
      }, () => {
        this.loadQuestion(this.data.currentQuestion);
      });
    }
  },

  // 下一题
  nextQuestion: function() {
    if (this.data.currentQuestion < this.data.totalQuestions) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1,
        answer: '',
        showAnalysis: false
      }, () => {
        this.loadQuestion(this.data.currentQuestion);
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '已经是最后一题了，是否返回首页？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    }
  }
}); 