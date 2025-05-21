import {
    getUserInfo
} from '../../api/getUserInfo'
import {
    getDailyFinesh
} from '../../api/getDeilyFinash'
import {
    getAllCount
} from '../../api/getAllCount'
import {
    getLearnTime
} from '../../api/getLearnTime'
Page({
    data: {
        allCount: 0,
        ifFinash: 0,
        motto: 'Hello World',
        userInfo: {
            name: ''
        },
        hasUserInfo: false,
        canIUseGetUserProfile: wx.canIUse('getUserProfile'),
        canIUseNicknameComp: wx.canIUse('input.type.nickname'),
        studyTime: 0,
        totalQuestions: 0,
        // correctRate: '',
        totalTime: 0,
        recentExams: [],
        recommended: [],
        currentDate: '',
        practiceCount: 0,
        studyStats: {
            totalQuestions: 0,
            correctRate: '',
            totalTime: 0
        },
        lastCheckDate: ''
    },
    onLoad() {
        this.setCurrentDate();
        this.loadUserInfo();
        this.getUserInfo();
        this.getStudyStats();
        this.checkAndResetDailyStatus();
        this.getUserLearnTime();
        this.getAllCountfn()

    },
    onShow() {
        this.getAllCountfn()
        this.getUserInfo();
        this.getStudyStats();
        this.checkAndResetDailyStatus();
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 0
            });
            // 更新tabBar显示
            this.getTabBar().updateTabBar();
        }
        this.getUserLearnTime();
    },
    bindViewTap() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    // 获取总题目数
    getAllCountfn() {
        getAllCount().then(res => {
            console.log("总题数", res);
            this.setData({
                allCount: res
            })
            console.log("总题数111", this.data.allCount);

        })
    },
    // 获取用户完成情况
    userFinash() {
        getDailyFinesh().then(res => {
            console.log(res);
            this.setData({
                ifFinash: res
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

    
    // 获取信息
    getStudyStats() {
        getUserInfo().then(res => {
            console.log(res.rightPercent);
            this.setData({
                studyStats: {
                    totalQuestions: res.count,
                    correctRate: res.rightPercent,
                    totalTime: 120
                }
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
    // 检查是否登录
    checkLogin() {
        const userInfo = wx.getStorageSync('userInfo');
        const name = wx.getStorageSync('name');
        return !!(userInfo || name);
    },
    goToTopicalPractice(e) {
        if (!this.checkLogin()) {
            this.showLoginTip();
            return;
        }
        const {
            category
        } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/practice/topical/index?category=${category}`
        });
    },
    // 每日练习
    goToDailyPractice(e) {
        if (!this.checkLogin()) {
            this.showLoginTip();
            return;
        }
        /* const {
            ifFinash
        } = this.data;
        if (ifFinash === 100) {
            wx.showModal({
                title: '提示',
                content: '今日练习已完成，明天再来吧！',
                showCancel: false,
                confirmText: '我知道了',
                confirmColor: '#1890ff',
                success: (res) => {
                    if (res.confirm) {
                        console.log('用户点击确定');
                    }
                }
            });
            return;
        } */
        wx.navigateTo({
            url: '/pages/practice/daily/index'
        });
    },
    // 法律
    goToResources(e) {
        if (!this.checkLogin()) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: `/pages/resources/law_type/index`
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
    },
    // 获取用户学习时间
    getUserLearnTime() {
        // const learnTime = wx.getStorageSync('learnTime');
        getLearnTime().then(res => {
            console.log(res);
            this.setData({
                'studyTime': res
            });
        })
        
    },
    // 获取用户信息
    getUserInfo() {
        const userInfo = wx.getStorageSync('userInfo');
        const name = wx.getStorageSync('name');
        if (userInfo) {
            this.setData({
                userInfo: userInfo
            });
        } else if (name) {
            this.setData({
                'userInfo.name': name
            });
        }
    },
    // 检查并重置每日状态
    checkAndResetDailyStatus() {
        const today = new Date().toDateString();
        const lastCheckDate = wx.getStorageSync('lastCheckDate');

        // 如果是新的一天，重置完成状态
        if (lastCheckDate !== today) {
            this.setData({
                ifFinash: 0
            });
            wx.setStorageSync('lastCheckDate', today);
        }

        // 重新获取完成状态
        this.userFinash();
    },
})