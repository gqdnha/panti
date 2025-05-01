import { getAllUserInfo } from '../../../api/getAlluserInfo'; // 请根据实际路径修改

Page({
    data: {
        userId: null,
        userInfo: {},
        answerRecords: [],
        userList: [],
        pageNum: 1,
        pageSize: 10,
        totalPages: 1
    },

    onLoad(options) {
        const { id } = options;
        this.setData({
            userId: id
        });
        // this.getUserInfo();
        this.loadUserStats();
    },
    loadUserStats() {
        const { pageNum, pageSize } = this.data;
        const data = {
            department: "",
            userName: "",
            pageNum: pageNum,
            pageSize: pageSize
    }
        console.log(data);
        getAllUserInfo(data).then(res => {
            console.log(res);
            // 假设 res 包含 userList 和 totalPages 数据
            /* this.setData({
                userList: res.data.userList,
                totalPages: res.data.totalPages
            }); */
        }).catch(err => {
            console.error(err);
        });
    },



    viewAnswerDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    viewDetail(e) {
        const userId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/admin/user-detail/index?id=${userId}`
        });
    },

    exportUserData(e) {
        const userId = e.currentTarget.dataset.id;
        wx.showToast({
            title: '导出成功',
            icon: 'success'
        });
    },

    // 分页器点击事件
    onPageChange(e) {
        const pageNum = e.detail.current + 1;
        this.setData({
            pageNum
        });
        this.loadUserStats();
    }
});