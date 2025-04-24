const { mockQuestions } = require('../../../data/mock');

Page({
  data: {
    currentIndex: 0,
    totalQuestions: 0,
    currentQuestion: null,
    progress: 0,
    remainingTime: 60,
    hasAnswered: false,
    showResult: false,
    isCorrect: false,
    timer: null
  },

  onLoad() {
    this.loadQuestions();
    this.startTimer();
  },

  onUnload() {
    this.clearTimer();
  },

  // 加载题目
  loadQuestions() {
    const practiceData = wx.getStorageSync('currentPractice');
    if (!practiceData || !practiceData.questions) {
      // 如果没有练习数据，使用测试数据
      const testQuestions = mockQuestions.slice(0, 5); // 取前5道题作为测试
      this.setData({
        totalQuestions: testQuestions.length,
        currentQuestion: this.formatQuestion(testQuestions[0])
      });
      return;
    }

    this.setData({
      totalQuestions: practiceData.questions.length,
      currentQuestion: this.formatQuestion(practiceData.questions[0])
    });
  },

  // 格式化题目数据
  formatQuestion(question) {
    return {
      ...question,
      options: question.options.map((option, index) => ({
        label: String.fromCharCode(65 + index),
        content: option,
        selected: false,
        status: ''
      }))
    };
  },

  // 选择选项
  selectOption(e) {
    if (this.data.hasAnswered) return;

    const optionIndex = e.currentTarget.dataset.index;
    const currentQuestion = this.data.currentQuestion;
    const options = currentQuestion.options.map((option, index) => ({
      ...option,
      selected: index === optionIndex,
      status: index === optionIndex ? 'selected' : ''
    }));

    this.setData({
      'currentQuestion.options': options,
      hasAnswered: true
    });

    this.checkAnswer(optionIndex);
  },

  // 检查答案
  checkAnswer(selectedIndex) {
    const currentQuestion = this.data.currentQuestion;
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;
    
    // 更新选项状态
    const options = currentQuestion.options.map((option, index) => ({
      ...option,
      status: index === currentQuestion.correctAnswer ? 'correct' : 
              index === selectedIndex && !isCorrect ? 'wrong' : ''
    }));

    this.setData({
      'currentQuestion.options': options,
      isCorrect,
      showResult: true
    });

    // 更新统计信息
    this.updateStatistics(isCorrect);
  },

  // 更新统计信息
  updateStatistics(isCorrect) {
    const todayProgress = wx.getStorageSync('todayProgress') || {
      completed: 0,
      correct: 0,
      wrong: 0
    };

    todayProgress.completed++;
    if (isCorrect) {
      todayProgress.correct++;
    } else {
      todayProgress.wrong++;
    }

    wx.setStorageSync('todayProgress', todayProgress);

    // 更新知识点统计
    this.updateKnowledgeStats(isCorrect);
  },

  // 更新知识点统计
  updateKnowledgeStats(isCorrect) {
    const knowledgeStats = wx.getStorageSync('knowledgeStats') || {};
    const currentQuestion = this.data.currentQuestion;

    currentQuestion.knowledgePoints.forEach(point => {
      if (!knowledgeStats[point]) {
        knowledgeStats[point] = { total: 0, correct: 0 };
      }
      knowledgeStats[point].total++;
      if (isCorrect) {
        knowledgeStats[point].correct++;
      }
    });

    wx.setStorageSync('knowledgeStats', knowledgeStats);
  },

  // 跳过题目
  skipQuestion() {
    this.nextQuestion();
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentIndex + 1 >= this.data.totalQuestions) {
      this.finishPractice();
      return;
    }

    const practiceData = wx.getStorageSync('currentPractice');
    const nextQuestion = this.formatQuestion(practiceData.questions[this.data.currentIndex + 1]);

    this.setData({
      currentIndex: this.data.currentIndex + 1,
      currentQuestion: nextQuestion,
      hasAnswered: false,
      showResult: false,
      progress: Math.round(((this.data.currentIndex + 1) / this.data.totalQuestions) * 100)
    });

    this.resetTimer();
  },

  // 完成练习
  finishPractice() {
    wx.showModal({
      title: '练习完成',
      content: '恭喜你完成本次练习！',
      showCancel: false,
      success: () => {
        wx.navigateBack();
      }
    });
  },

  // 关闭结果弹窗
  closeResult() {
    this.setData({
      showResult: false
    });
  },

  // 开始计时器
  startTimer() {
    this.clearTimer();
    this.data.timer = setInterval(() => {
      if (this.data.remainingTime > 0) {
        this.setData({
          remainingTime: this.data.remainingTime - 1
        });
      } else {
        this.timeUp();
      }
    }, 1000);
  },

  // 重置计时器
  resetTimer() {
    this.setData({
      remainingTime: 60
    });
    this.startTimer();
  },

  // 清除计时器
  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  // 时间到
  timeUp() {
    this.clearTimer();
    if (!this.data.hasAnswered) {
      this.skipQuestion();
    }
  }
}); 