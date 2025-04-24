// pages/practice/daily/index.js
const { questions } = require('../../../data/questions');
const { knowledgePoints } = require('../../../data/categories');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    completedCount: 0,
    streakDays: 0,
    modes: [
      { id: 'mode1', name: '每日20题', count: 20, desc: '固定20题' },
      { id: 'mode2', name: '每日30题', count: 30, desc: '固定30题' },
      { id: 'mode3', name: '随机练习', count: 0, desc: '不限数量' }
    ],
    currentMode: 'mode1',
    progress: {
      percentage: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0
    },
    knowledgeDistribution: [],
    canStartPractice: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initData();
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
    this.loadProgress();
    this.loadKnowledgeDistribution();
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

  // 初始化数据
  initData() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    
    this.setData({
      date: dateStr
    });
  },

  // 切换练习模式
  switchMode(e) {
    const modeId = e.currentTarget.dataset.id;
    this.setData({
      currentMode: modeId
    });
  },

  // 加载进度数据
  loadProgress() {
    // 从本地存储获取今日进度
    const todayProgress = wx.getStorageSync('todayProgress') || {
      completed: 0,
      correct: 0,
      wrong: 0
    };

    const total = this.data.modes.find(m => m.id === this.data.currentMode).count;
    const percentage = total ? Math.round((todayProgress.completed / total) * 100) : 0;
    const accuracy = todayProgress.completed ? 
      Math.round((todayProgress.correct / todayProgress.completed) * 100) : 0;

    this.setData({
      'progress.percentage': percentage,
      'progress.correct': todayProgress.correct,
      'progress.wrong': todayProgress.wrong,
      'progress.accuracy': accuracy,
      completedCount: todayProgress.completed
    });
  },

  // 加载知识点分布
  loadKnowledgeDistribution() {
    // 从本地存储获取知识点统计
    const knowledgeStats = wx.getStorageSync('knowledgeStats') || {};
    
    const distribution = Object.entries(knowledgePoints).map(([key, name]) => {
      const stats = knowledgeStats[key] || { total: 0, correct: 0 };
      const percentage = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      return {
        name,
        count: stats.total,
        percentage
      };
    });

    this.setData({
      knowledgeDistribution: distribution
    });
  },

  // 开始练习
  startPractice() {
    if (!this.data.canStartPractice) {
      return;
    }

    const mode = this.data.modes.find(m => m.id === this.data.currentMode);
    const total = mode.count;
    
    // 获取今日已完成的题目
    const todayProgress = wx.getStorageSync('todayProgress') || {
      completed: 0,
      correct: 0,
      wrong: 0
    };

    // 检查是否已完成今日练习
    if (total && todayProgress.completed >= total) {
      wx.showToast({
        title: '今日练习已完成',
        icon: 'none'
      });
      return;
    }

    // 根据模式筛选题目
    let practiceQuestions = [];
    if (mode.id === 'mode3') {
      // 随机模式：随机选择20题
      practiceQuestions = this.getRandomQuestions(20);
    } else {
      // 固定模式：从未完成的题目中选择
      const remainingCount = total - todayProgress.completed;
      practiceQuestions = this.getRandomQuestions(remainingCount);
    }

    // 保存练习题目到本地存储
    wx.setStorageSync('currentPractice', {
      questions: practiceQuestions,
      mode: mode.id,
      startTime: new Date().getTime()
    });

    // 跳转到答题页面
    wx.navigateTo({
      url: '/pages/practice/question/index'
    });
  },

  // 获取随机题目
  getRandomQuestions(count) {
    const allQuestions = [...questions];
    const result = [];
    
    for (let i = 0; i < count && allQuestions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      result.push(allQuestions[randomIndex]);
      allQuestions.splice(randomIndex, 1);
    }
    
    return result;
  }
})