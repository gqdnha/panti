import { getAllQuestion, addNewQuestion } from '../../../api/admin'
Page({
    data: {
        questionList: [],
        pageNum: 1,
        pageSize: 8,
        searchKeyword: '',
        isLoading: false,
        totalPages: 1,
        isAddModalVisible: false,
        newQuestion: {
            type: '',
            content: '',
            options: '',
            answer: '',
            category: '',
            analysis: ''
        },
        questionTypes: ['单选题', '多选题', '填空题', '判断题']
    },

    onLoad(options) {
        this.loadQuestions()
    },
    loadQuestions() {
        const { pageNum, pageSize, searchKeyword } = this.data;
        const data = {
            category: "",
            // 判断 searchKeyword 是否有值，有则传其值，否则传空字符串
            content: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        // console.log(data);
        getAllQuestion(data).then(res => {
            console.log(res);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                questionList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.questionList);
            console.log(this.data.totalPages);
        }).catch(err => {
            console.error(err);
        });
    },

    onSearchInput(e) {
        this.setData({
            searchKeyword: e.detail.value
        });
        console.log(this.data.searchKeyword);
    },

    onSearch() {
        // 重置页码为 1
        this.setData({ pageNum: 1 });
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
        this.setData({
            isAddModalVisible: true,
            newQuestion: {
                type: '',
                content: '',
                options: '',
                answer: '',
                category: '',
                analysis: ''
            }
        })
    },

    onAddModalClose() {
        this.setData({
            isAddModalVisible: false
        })
    },

    onNewQuestionInput(e) {
        const { field } = e.currentTarget.dataset
        const value = e.detail.value
        this.setData({
            newQuestion: {
               ...this.data.newQuestion,
                [field]: value
            }
        })
    },

    onSubmitNewQuestion() {
        const { newQuestion } = this.data
        addNewQuestion(newQuestion).then(res => {
            wx.showToast({
                title: '题目添加成功',
                icon: 'success'
            })
            this.onAddModalClose()
            this.loadQuestions()
        }).catch(error => {
            console.error('添加题目失败:', error)
            wx.showToast({
                title: '添加题目失败',
                icon: 'none'
            })
        })
    }
})