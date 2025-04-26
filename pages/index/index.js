// index.js
const { mockUserInfo, mockStatistics, mockRecentExams, mockRecommended } = require('../../data/mock');
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    studyTime: 0,
    questionCategories: [
      {
        id: 1,
        name: '单选题',
        description: '基础题型',
        icon: '/assets/icons/single-choice.png'
      },
      {
        id: 2,
        name: '多选题',
        description: '进阶题型',
        icon: '/assets/icons/multiple-choice.png'
      },
      {
        id: 3,
        name: '判断题',
        description: '快速练习',
        icon: '/assets/icons/true-false.png'
      },
      {
        id: 4,
        name: '简答题',
        description: '综合能力',
        icon: '/assets/icons/short-answer.png'
      }
    ],
    totalQuestions: 0,
    correctRate: 0,
    totalTime: 0,
    recentExams: [],
    recommended: [],
    currentDate: '',
    practiceCount: 0,
    // 题目类型配置
    questionTypes: {
      single: '单选（点选+提交）',
      multiple: '多选（句选+提交）',
      judgment: '判断（点选+提交）',
      fillBlank: '填空（输入框+提交）',
      shortAnswer: '简答（文本框+提交）',
      caseAnalysis: '案例分析（文本框+提交）'
    },
    // 专题分类
    topicCategories: [
      '法律法规',
      '规章办法',
      '标准规范',
      '政策制度',
      '其他'
    ],
    // 每日练习选项
    dailyOptions: [
      { count: 20, label: '20题/日' },
      { count: 30, label: '30题/日' },
      { random: true, label: '题目随机' }
    ],
    // 资料库分类
    resourceCategories: [
      '法律法规',
      '规章',
      '标准',
      '导则'
    ],
    // 统计数据
    statistics: {
      correctRate: {
        weekly: [],
        monthly: []
      },
      studyTime: 0,
      wrongQuestions: {
        byType: {},
        byKnowledgePoint: {},
        byTime: {}
      }
    }
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    this.setCurrentDate();
    this.loadUserInfo();
    this.loadStatistics();
    this.getRecentExams();
    this.getRecommended();
  },
  onShow() {
    // 每次显示页面时更新数据
    this.getUserInfo();
    this.getStudyStats();
  },
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || mockUserInfo;
    this.setData({
      userInfo
    });
  },
  getStudyStats() {
    // 使用模拟数据，添加默认值防止undefined
    const userInfo = this.data.userInfo || mockUserInfo || {
      studyTime: 0,
      totalQuestions: 0,
      correctRate: 0,
      totalTime: 0
    };

    this.setData({
      studyTime: userInfo.studyTime || 0,
      totalQuestions: userInfo.totalQuestions || 0,
      correctRate: userInfo.correctRate || 0,
      totalTime: userInfo.totalTime || 0
    });
  },
  getRecentExams() {
    // 使用模拟数据
    this.setData({
      recentExams: mockRecentExams
    });
  },
  getRecommended() {
    // 使用模拟数据
    this.setData({
      recommended: mockRecommended
    });
  },
  navigateToCategory(e) {
    const { type } = e.currentTarget.dataset;
    if (!this.data.userInfo) {
      this.showLoginTip();
      return;
    }
    wx.navigateTo({
      url: `/pages/question-category/index?type=${type}`
    });
  },
  startExam(e) {
    const { id } = e.currentTarget.dataset;
    if (!this.data.userInfo) {
      this.showLoginTip();
      return;
    }
    wx.navigateTo({
      url: `/pages/exam/index?id=${id}`
    });
  },
  startPractice(e) {
    const { id } = e.currentTarget.dataset;
    if (!this.data.userInfo) {
      this.showLoginTip();
      return;
    }
    wx.navigateTo({
      url: `/pages/practice/index?id=${id}`
    });
  },
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }
      }
    });
  },
  setCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    this.setData({
      currentDate: `${year}年${month}月${day}日`
    });
  },
  // 基础理论相关功能
  goToSequentialPractice() {
    wx.navigateTo({
      url: '/pages/practice/sequential/index'
    });
  },
  goToTopicalPractice(e) {
    const { category } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/practice/topical/index?category=${category}`
    });
  },
  goToDailyPractice(e) {
    const { option } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/practice/daily/index?option=${JSON.stringify(option)}`
    });
  },
  // 资料库
  goToResources(e) {
    const { category } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/resources/index?category=${category}`
    });
  },
  // 综合题相关功能
  goToShortAnswer() {
    wx.navigateTo({
      url: '/pages/comprehensive/short-answer/index'
    });
  },
  goToCaseAnalysis() {
    wx.navigateTo({
      url: '/pages/comprehensive/case-analysis/index'
    });
  },
  // 个人数据统计相关功能
  goToAnswerStats() {
    wx.navigateTo({
      url: '/pages/stats/answer-stats/index',
      success: () => {
        // 预加载统计数据
        wx.setStorage({
          key: 'statsData',
          data: this.data.statistics
        });
      }
    });
  },
  goToWrongQuestions() {
    wx.navigateTo({
      url: '/pages/stats/wrong-questions/index'
    });
  },
  goToAnswerHistory() {
    if (!this.data.userInfo) {
      this.showLoginTip();
      return;
    }
    wx.navigateTo({
      url: '/pages/history/index'
    });
  },
  // 用户反馈
  onFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/index'
    });
  },
  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },
  // 加载统计数据
  loadStatistics() {
    // 使用模拟数据
    this.setData({
      statistics: mockStatistics
    });
  },
  // 检查题目作答时间
  checkAnswerTime() {
    // 这里只显示用户开始作答至当前的总用时
    const startTime = wx.getStorageSync('answerStartTime');
    if (startTime) {
      const currentTime = new Date().getTime();
      const duration = Math.floor((currentTime - startTime) / 1000 / 60); // 转换为分钟
      return duration;
    }
    return 0;
  },
  // 显示进度条
  showProgress(current, total) {
    return `${current}/${total}`;
  }
})
