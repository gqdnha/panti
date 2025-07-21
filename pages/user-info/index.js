// import { getUserId } from '../../api/getUserId';
import { getUserInfo } from '../../api/getUserInfo'
import { setupTabBar } from '../../utils/tabBar';
import {getLearnTime} from '../../api/getLearnTime'
import {getWrongCount} from '../../api/getWrongCount'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,
        studyStats: {
            totalQuestions: 0,
            correctRate: '',
        },
        studyTime: 0,
        studyTimeFormatted: '',
        wrongBookCount:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getUserInfo();
        this.getStudyStats();
        this.getUserLearnTime();
        this.getWrongCountApi()
    },
    // 获取错题数量
    getWrongCountApi() {
        getWrongCount().then(res => {
            console.log(res,'111');
            this.setData({
                wrongBookCount :res
            })
        })
    },
    getUserLearnTime() {
        // const learnTime = wx.getStorageSync('learnTime');
        getLearnTime().then(res => {
            console.log(res);
            this.setData({
                'studyTime': res,
                'studyTimeFormatted': this.formatTime(res)
            });
        })
    },
    formatTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}小时${m}分钟`;
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
        this.getUserLearnTime();
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 1
            });
        }
        this.getStudyStats();
        this.getUserInfo();
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

    // 获取用户信息
    getUserInfo() {
        const name = wx.getStorageSync('name');
        const phone = wx.getStorageSync('phone');
        const department = wx.getStorageSync('department');
        console.log(phone);

        if (name || phone || department) {
            this.setData({
                userInfo: {
                    nickName: name || '未登录',
                    phone: phone || '未登录',
                    department: department || '未登录'
                }
            });
        }
    },

    // 从服务器获取学习统计数据
    getStudyStats() {
        getUserInfo().then(res => {
            console.log(res.rightPercent);
            this.setData({
                studyStats: {
                    totalQuestions: res.count,
                    correctRate: res.rightPercent,
                }
            });
            console.log(this.data.studyStats);
        })
    },

    navigateToSettings() {
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: '/pages/setting/setting'
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

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除用户信息
                    wx.removeStorageSync('userInfo');
                    wx.removeStorageSync('userId');
                    wx.removeStorageSync('name');
                    wx.removeStorageSync('phone');
                    wx.removeStorageSync('department');
                    wx.removeStorageSync('role');
                    this.setData({
                        userInfo: null
                    });
                    wx.showToast({
                        title: '已退出登录',
                        icon: 'success'
                    });
                    wx.navigateTo({
                        url: '/pages/login/index'
                    });
                    
                }
            }
        });
    },

    // 去错题本
    goToWrongQuestions() {
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: '/pages/wrongBook/wrongBook'
        });
    },

    // 去答题历史
    goToAnswerHistory() {
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: '/pages/history/history'
        });
    },

    navigateToLoginIfNotLoggedIn() {
        if (!this.data.userInfo) {
            wx.navigateTo({
                url: '/pages/login/index'
            });
        }
    }
})    