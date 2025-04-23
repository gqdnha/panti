// index.js
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
    recommended: []
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
    this.getUserInfo();
    this.getStudyStats();
    this.getRecentExams();
    this.getRecommended();
  },
  onShow() {
    // 每次显示页面时更新数据
    this.getUserInfo();
    this.getStudyStats();
  },
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo
    });
  },
  getStudyStats() {
    // TODO: 从服务器获取学习统计数据
    // 这里使用模拟数据
    this.setData({
      studyTime: 45,
      totalQuestions: 100,
      correctRate: 85,
      totalTime: 120
    });
  },
  getRecentExams() {
    // TODO: 从服务器获取最近考试数据
    // 这里使用模拟数据
    const recentExams = [
      {
        id: 1,
        name: 'JavaScript基础测试',
        time: '2024-03-20 14:30',
        duration: 30,
        status: 'upcoming'
      },
      {
        id: 2,
        name: 'Vue.js进阶测试',
        time: '2024-03-19 16:45',
        duration: 25,
        status: 'ongoing'
      },
      {
        id: 3,
        name: 'React基础测试',
        time: '2024-03-18 10:20',
        duration: 35,
        status: 'ended'
      }
    ];

    this.setData({
      recentExams
    });
  },
  getRecommended() {
    // TODO: 从服务器获取推荐练习数据
    // 这里使用模拟数据
    const recommended = [
      {
        id: 1,
        name: 'JavaScript基础练习',
        description: '掌握JavaScript基础知识',
        icon: '/images/js.png',
        questionCount: 50,
        difficulty: '简单'
      },
      {
        id: 2,
        name: 'Vue.js实战练习',
        description: 'Vue.js框架应用实践',
        icon: '/images/vue.png',
        questionCount: 30,
        difficulty: '中等'
      },
      {
        id: 3,
        name: 'React核心概念',
        description: '深入理解React核心概念',
        icon: '/images/react.png',
        questionCount: 40,
        difficulty: '困难'
      }
    ];

    this.setData({
      recommended
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
  }
})
