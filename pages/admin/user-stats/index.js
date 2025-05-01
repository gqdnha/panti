import { getAllUserInfo } from '../../../api/admin'
Page({
    data: {
        userId: null,
        userInfo: {},
        answerRecords: [],
        userList: [],
        pageNum: 1,
        pageSize: 8,
        totalPages: 1,
        searchKeyword: ''
    },

    onLoad(options) {
        this.loadUserStats();
    },

    loadUserStats() {
        const { pageNum, pageSize, searchKeyword } = this.data;
        const data = {
            department: "",
            // 判断 searchKeyword 是否有值，有则传其值，否则传空字符串
            userName: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getAllUserInfo(data).then(res => {
            console.log(res);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                userList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.userList);
            console.log(this.data.totalPages);
        }).catch(err => {
            console.error(err);
        });
    },

    onSearchInput(e) {
        this.setData({
            searchKeyword: e.detail.value
        });
    },

    onSearch() {
        // 重置页码为 1
        this.setData({ pageNum: 1 });
        this.loadUserStats();
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

    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ pageNum: pageNum + 1 });
            this.loadUserStats();
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    onPreviousPage() {
        const { pageNum } = this.data;
        if (pageNum > 1) {
            this.setData({ pageNum: pageNum - 1 });
            this.loadUserStats();
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    },

    importQuestions() {
        wx.showToast({
            title: '开发中...',
            icon: 'none'
        });
    },

    exportQuestions() {
        wx.showToast({
            title: '导出成功',
            icon: 'success'
        });
    },

    editQuestion(e) {
        const questionId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/admin/question-edit/index?id=${questionId}`
        });
    },

    deleteQuestion(e) {
        const questionId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这道题目吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                }
            }
        });
    },

    onAddModalClose() {
        this.setData({
            isAddModalVisible: false
        });
    },

    onNewQuestionInput(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({
            newQuestion: {
               ...this.data.newQuestion,
                [field]: value
            }
        });
    }
});    