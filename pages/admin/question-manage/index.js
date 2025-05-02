import { getAllQuestion, addNewQuestion, deleteQuestion } from '../../../api/admin'
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
        questionTypes: ['单选题', '多选题', '填空题', '判断题'],
        newQuestionTypeIndex: 0
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

    deleteQuestion(e) {
        const questionId = e.currentTarget.dataset.id.toString();
        console.log(questionId);
        console.log(typeof questionId);
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这道题目吗？',
            success: (res) => {
                if (res.confirm) {
                    // 调用修改后的deleteQuestion接口，并传入questionId
                    deleteQuestion(questionId).then(() => {
                        wx.showToast({
                            title: '删除成功',
                            icon:'success'
                        });
                        // 删除成功后重新加载题目列表
                        this.loadQuestions();
                    })
                   .catch(error => {
                        console.error('删除题目失败:', error);
                        wx.showToast({
                            title: '删除题目失败',
                            icon: 'none'
                        });
                    });
                }
            }
        });
    },

    // 搜索
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
            icon:'success'
        })
    },

    editQuestion(e) {
        const questionId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/admin/question-edit/index?id=${questionId}`
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
            },
            newQuestionTypeIndex: 0
        }, () => {
            this.onQuestionTypeChange({ detail: { value: 0 } });
        });
    },

    onAddModalClose() {
        this.setData({
            isAddModalVisible: false
        })
    },

    onQuestionTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.questionTypes[index];
        this.setData({
            newQuestionTypeIndex: index,
            'newQuestion.type': type
        });
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
        let { newQuestion } = this.data;
        // 这里不再将选项转为数组，直接使用字符串
        if (newQuestion.type === '单选题' || newQuestion.type === '多选题') {
            newQuestion.options = newQuestion.options.trim();
        }
        addNewQuestion(newQuestion).then(res => {
            wx.showToast({
                title: '题目添加成功',
                icon:'success'
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