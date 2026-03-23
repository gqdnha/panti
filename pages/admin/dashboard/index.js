import {
    getAllUserInfo,
    getUserToday
} from '../../../api/admin'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNum: 1,
        pageSize: 1,
        totalUsers: 0,
        todayUsers: 0,
        avgCorrectRate: 0,
        dailyQuestionRate: '',
        dailyQuestionUserCount: 0,
        department: '',
        region: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取部门和地区信息
        const department = wx.getStorageSync('department');
        const region = wx.getStorageSync('region');
        console.log('当前用户部门：', department);
        console.log('当前用户region：', region);
        this.setData({
            department: department || '',
            region: region || '0'
        });

        // 加载数据
        this.loadUserStats()
        this.getUserToday()
    },
    loadUserStats() {
        const {
            pageNum,
            pageSize,
            region
        } = this.data;
        const data = {
            region: region,
            department: "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log('传递的参数：', data);
        getAllUserInfo(data).then(res => {
            console.log(res.pageInfo);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                totalUsers: res.pageInfo.totalSize
            });
            console.log(this.data.totalUsers);
        }).catch(err => {
            console.error(err);
        });
    },
    // 获取今日用户及完成率
    getUserToday() {
        const { region, department } = this.data;
        console.log('传递给getUserToday的参数：', { region, department });
        getUserToday(region, department === '超级管理员' ? '' : department).then(res => {
            console.log(res);
            console.log(res.dailyQuestionRate);
            this.setData({
                todayUsers: res.todayRegisterCount || 0,
                avgCorrectRate: res.accuracyRate || 0,
                dailyQuestionRate: res.dailyQuestionRate,
                dailyQuestionUserCount: res.dailyQuestionUserCount
            });
            console.log(this.data.dailyQuestionRate);
            console.log(this.data.dailyQuestionUserCount);
        }).catch(err => {
            console.error(err);
        });
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
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                selected: 2
            });
            this.getTabBar().updateTabBar();
        }
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

    // 检查权限
    checkPermission() {
        if (this.data.department !== '超级管理员') {
            wx.showToast({
                title: '您没有权限访问此功能',
                icon: 'none',
                duration: 2000
            });
            return false;
        }
        return true;
    },

    // 导航到用户答题统计页面
    navigateToUserStats() {
        // if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/user-stats/index'
        })
    },

    // 导航到题目管理页面
    navigateToQuestionManage() {
        if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/question-manage/index'
        })
    },

    // 导航到法律管理页面
    navigateToLawManage() {
        if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/law/law'
        })
    },

    // 易错50题
    navigateTo20Mistake() {
        wx.navigateTo({
            url: '/pages/canMistake20/canMistake20'
        })
    },
    // 可视化
    navigateapartEchatrs() {
        if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/apartmentEcharts/apartmentEcharts'
        })
    },

    navigateToPhoneManage() {
        if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/phone-manage/index'
        });
    },
    goToDepartmentManage() {
        if (!this.checkPermission()) return;
        wx.navigateTo({
            url: '/pages/admin/department-manage/index'
        });
    }
})