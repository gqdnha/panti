import {getUserInfo} from '../../api/getUserInfo'
import {getDailyFinesh} from '../../api/getDeilyFinash'

Page({
    data: {
        ifFinash:0,
        motto: 'Hello World',
        userInfo: null,
        hasUserInfo: false,
        canIUseGetUserProfile: wx.canIUse('getUserProfile'),
        canIUseNicknameComp: wx.canIUse('input.type.nickname'),
        studyTime: 0,
        totalQuestions: 0,
        correctRate: 0,
        totalTime: 0,
        recentExams: [],
        recommended: [],
        currentDate: '',
        practiceCount: 0,
    },
    bindViewTap() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    // 获取用户完成情况
    userFinash() {
        getDailyFinesh().then(res => {
            console.log(res);
            this.setData({
                ifFinash:res
            })
        })
    },
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        const {
            nickName
        } = this.data.userInfo
        this.setData({
            "userInfo.avatarUrl": avatarUrl,
            hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
        })
    },
    onInputChange(e) {
        const nickName = e.detail.value
        const {
            avatarUrl
        } = this.data.userInfo
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
        this.userFinash()
        // this.loadStatistics();
        // this.getRecentExams();
        // this.getRecommended();
    },
    onShow() {
        // 每次显示页面时更新数据
        // this.getUserInfo();
        this.getStudyStats();
    },
    // 获取信息
    getStudyStats() {
        // 使用模拟数据，添加默认值防止undefined
        getUserInfo().then (res => {
            console.log(res);
            this.setData({
                // studyTime : res.
                totalQuestions:res.count || 0,
                correctRate:res.rightPercent || 0,
            });
        })  
    },

    navigateToCategory(e) {
        const {
            type
        } = e.currentTarget.dataset;
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: `/pages/question-category/index?type=${type}`
        });
    },
    startExam(e) {
        const {
            id
        } = e.currentTarget.dataset;
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: `/pages/exam/index?id=${id}`
        });
    },
    startPractice(e) {
        const {
            id
        } = e.currentTarget.dataset;
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
        const {
            category
        } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/practice/topical/index?category=${category}`
        });
    },
    goToDailyPractice(e) {
        const {
            option
        } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/practice/daily/index?option=${JSON.stringify(option)}`
        });
    },
    // 法律
    goToResources(e) {
        /* const {
            category
        } = e.currentTarget.dataset; */
        wx.navigateTo({
            url: `/pages/resources/law_type/index`
        });
    },
    // 易错二十题
    goToMistake(e) {
        wx.navigateTo({
            url: `/pages/canMistake20/canMistake20`
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
            this.setData({
                userInfo
            });
        }
    },
    // 显示进度条
    showProgress(current, total) {
        return `${current}/${total}`;
    }
})