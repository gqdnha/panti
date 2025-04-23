// pages/question/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionId: null,
    categoryId: null,
    currentIndex: 0,
    totalQuestions: 0,
    remainingTime: 0,
    currentQuestion: {},
    questions: [],
    optionLabels: ['A', 'B', 'C', 'D', 'E', 'F']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id, categoryId } = options;
    this.setData({
      questionId: id,
      categoryId: categoryId
    });
    this.getQuestions();
    this.startTimer();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  getQuestions() {
    // TODO: 从服务器获取题目列表
    // 这里使用模拟数据
    const questions = [
      {
        id: 1,
        type: '单选题',
        content: '以下哪个是JavaScript的基本数据类型？',
        options: [
          { content: 'Array', selected: false },
          { content: 'Object', selected: false },
          { content: 'String', selected: false },
          { content: 'Function', selected: false }
        ],
        answer: null
      },
      {
        id: 2,
        type: '多选题',
        content: '以下哪些是前端框架？',
        options: [
          { content: 'React', selected: false },
          { content: 'Vue', selected: false },
          { content: 'Angular', selected: false },
          { content: 'jQuery', selected: false }
        ],
        answer: null
      },
      {
        id: 3,
        type: '判断题',
        content: 'JavaScript是一种强类型语言。',
        options: [
          { content: '正确', selected: false },
          { content: '错误', selected: false }
        ],
        answer: null
      },
      {
        id: 4,
        type: '简答题',
        content: '请简述Vue的生命周期钩子函数。',
        answer: ''
      }
    ];

    this.setData({
      questions,
      totalQuestions: questions.length,
      currentQuestion: questions[0]
    });
  },

  startTimer() {
    // 设置初始时间（分钟）
    let time = 30;
    this.setData({
      remainingTime: time
    });

    this.timer = setInterval(() => {
      time--;
      this.setData({
        remainingTime: time
      });

      if (time <= 0) {
        clearInterval(this.timer);
        this.submitAnswer();
      }
    }, 60000); // 每分钟更新一次
  },

  selectOption(e) {
    const { index } = e.currentTarget.dataset;
    const { currentIndex, questions } = this.data;
    const currentQuestion = questions[currentIndex];

    // 清除其他选项的选中状态
    currentQuestion.options.forEach(option => {
      option.selected = false;
    });

    // 设置当前选项为选中状态
    currentQuestion.options[index].selected = true;

    this.setData({
      questions,
      currentQuestion
    });
  },

  selectMultiOption(e) {
    const { index } = e.currentTarget.dataset;
    const { currentIndex, questions } = this.data;
    const currentQuestion = questions[currentIndex];

    // 切换当前选项的选中状态
    currentQuestion.options[index].selected = !currentQuestion.options[index].selected;

    this.setData({
      questions,
      currentQuestion
    });
  },

  inputAnswer(e) {
    const { currentIndex, questions } = this.data;
    questions[currentIndex].answer = e.detail.value;

    this.setData({
      questions,
      currentQuestion: questions[currentIndex]
    });
  },

  prevQuestion() {
    if (this.data.currentIndex > 0) {
      this.setData({
        currentIndex: this.data.currentIndex - 1,
        currentQuestion: this.data.questions[this.data.currentIndex - 1]
      });
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.totalQuestions - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1,
        currentQuestion: this.data.questions[this.data.currentIndex + 1]
      });
    }
  },

  submitAnswer() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }

    // TODO: 提交答案到服务器
    wx.showLoading({
      title: '提交中...'
    });

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '提交成功',
        content: '您的答案已提交，是否查看结果？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 跳转到结果页面
            wx.navigateBack();
          } else {
            wx.navigateBack();
          }
        }
      });
    }, 1500);
  }
})