import { getAllUserInfo } from '../../../api/getAlluserInfo';

Page({
    data: {
        userId: null,
        userInfo: {},
        answerRecords: [],
        userList: [],
        currentUserName: ''
    },

    onLoad(options) {
        const { id } = options;
        this.setData({
            userId: id
        });
        this.getData();
    },

    getData: function () {
        // 初始请求传递空的 userName
        const userName = ''
        getAllUserInfo(userName).then(res => {
            console.log(res);
            // const userList = res.data && res.data.pageInfo && res.data.pageInfo.pageData || [];
            if (userList.length === 0) {
                wx.showToast({
                    title: '未找到用户数据',
                    icon: 'none'
                });
            }
            this.setData({
                userList: userList
            });
        }).catch(error => {
            console.error('获取用户信息失败:', error);
        });
    },

    onPullDownRefresh() {
        wx.stopPullDownRefresh();
    },

    viewAnswerDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    viewDetail(e) {
        const { userName } = e.currentTarget.dataset;
        this.setData({
            currentUserName: userName
        });
        getAllUserInfo({ userName }).then(res => {
            console.log('用户详情信息:', res);
            wx.navigateTo({
                url: `pages/detail/index?userName=${userName}`,
                success: () => {
                    const pages = getCurrentPages();
                    const currentPage = pages[pages.length - 1];
                    const nextPage = pages[pages.length];
                    if (nextPage) {
                        nextPage.setData({
                            userDetail: res.data && res.data.pageInfo && res.data.pageInfo.pageData[0] || {}
                        });
                    }
                }
            });
        }).catch(error => {
            console.error('获取用户详情信息失败:', error);
        });
    },

    exportUserData(e) {
        const { id } = e.currentTarget.dataset;
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    }
});