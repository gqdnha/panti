import {getAllQuestion} from '../../../api/admin'
Page({
    data: {
        questionList: [],
        pageNum: 1,
        pageSize: 8,
        searchKeyword: '',
        isLoading: false,
        totalPages: 1
    },

    onLoad(options) {
        this.loadQuestions()
    },

    loadQuestions() {
        if (this.data.isLoading) return
        this.setData({ isLoading: true })
        const { pageNum, pageSize, searchKeyword } = this.data
        const data = {
            "eh": "",
            "category": "",
            "pageNum": pageNum,
            "pageSize": pageSize,
            "keyword": searchKeyword
        }
        getAllQuestion(data).then(res => {
            console.log(res);
            const newQuestionList = res.pageInfo.pageData
            const totalPages = res.pageInfo.totalPage || 1
            if (newQuestionList.length > 0) {
                this.setData({
                    questionList: newQuestionList,
                    pageNum: pageNum,
                    totalPages: totalPages,
                    isLoading: false
                })
            } else {
                console.log('没有更多数据了');
                this.setData({ isLoading: false })
            }
        }).catch(error => {
            console.error('获取题目列表失败:', error);
            this.setData({ isLoading: false })
        })
    },

    onSearchInput(e) {
        this.setData({
            searchKeyword: e.detail.value
        })
    },

    onSearch() {
        this.setData({
            pageNum: 1,
            questionList: []
        })
        this.loadQuestions()
    },

    onNextPage() {
        const { pageNum, totalPages } = this.data
        if (pageNum < totalPages) {
            this.setData({ pageNum: pageNum + 1 })
            this.loadQuestions()
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            })
        }
    },

    onPreviousPage() {
        const { pageNum } = this.data
        if (pageNum > 1) {
            this.setData({ pageNum: pageNum - 1 })
            this.loadQuestions()
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            })
        }
    },

    importQuestions() {
        wx.showToast({
            title: '开发中...',
            icon: 'none'
        })
    },

    exportQuestions() {
        wx.showToast({
            title: '导出成功',
            icon: 'success'
        })
    },

    editQuestion(e) {
        const questionId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/admin/question-edit/index?id=${questionId}`
        })
    },

    deleteQuestion(e) {
        const questionId = e.currentTarget.dataset.id
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这道题目吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    })
                }
            }
        })
    },

    addQuestion() {
        wx.navigateTo({
            url: '/pages/admin/question-edit/index'
        })
    }
})    