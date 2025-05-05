import { getAllQuestion, addNewQuestion, deleteQuestionApi, updateQuestion, getQuestionDetail ,getWrongQuestionPercent } from '../../../api/admin';

Page({
    data: {
        // 正确率
        wrongQuestionPercent:'',
        
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
        newQuestionTypeIndex: 0,
        isEditModalVisible: false,
        editQuestion: {
            id: '',
            type: '',
            content: '',
            options: '',
            answer: '',
            category: '',
            analysis: '',
            
        },
        editQuestionTypeIndex: 0
    },

    onLoad(options) {
        this.loadQuestions();
    },

    loadQuestions() {
        const { pageNum, pageSize, searchKeyword } = this.data;
        const data = {
            category: "",
            content: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        getAllQuestion(data).then(res => {
            this.setData({
                questionList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
        }).catch(err => {
            console.error('加载题目列表失败:', err);
            wx.showToast({
                title: '加载题目列表失败',
                icon: 'none'
            });
        });
    },

    deleteQuestion(e) {
        const questionId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这道题目吗？',
            success: (res) => {
                if (res.confirm) {
                    deleteQuestionApi(questionId).then(() => {
                        wx.showToast({
                            title: '删除成功',
                            icon:'success'
                        });
                        this.loadQuestions();
                    }).catch(error => {
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

    onSearchInput(e) {
        this.setData({
            searchKeyword: e.detail.value
        });
    },

    onSearch() {
        this.setData({ pageNum: 1 });
        this.loadQuestions();
    },

    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ pageNum: pageNum + 1 });
            this.loadQuestions();
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
            this.loadQuestions();
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
            icon:'success'
        });
    },

    editQuestion(e) {
        const questionId = e.currentTarget.dataset.id;
        // console.log(questionId);
        // 获取详细信息
        getQuestionDetail(questionId).then((res) => {
            // console.log(res);
            const typeIndex = this.data.questionTypes.indexOf(res.type);
            this.setData({
                isEditModalVisible: true,
                editQuestion: {
                    id:res.questionId,
                    type: res.type,
                    content: res.content,
                    options: res.options,
                    answer: res.answer,
                    category: res.category,
                    analysis: res.analysis,
                    eh:res.eh
                },
                editQuestionTypeIndex: typeIndex
            })
        }).catch((err) => {
            console.error('获取题目详情失败:', err);
            wx.showToast({
                title: '获取题目详情失败',
                icon: 'none'
            });
        });

        // 获取正确率
        getWrongQuestionPercent(questionId).then(res => {
            // console.log(res);
            this.setData({
                wrongQuestionPercent:res*100
            })
            console.log(this.data.wrongQuestionPercent);
        })

    },

    // 添加题目
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
        });
    },

    onQuestionTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.questionTypes[index];
        this.setData({
            newQuestionTypeIndex: index,
            'newQuestion.type': type
        });
    },

    onInputChange(e, target) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({
            [target]: {
               ...this.data[target],
                [field]: value
            }
        });
    },

    onNewQuestionInput(e) {
        this.onInputChange(e, 'newQuestion');
    },

    validateQuestion(question) {
        if (!question.content) {
            wx.showToast({
                title: '题目内容不能为空',
                icon: 'none'
            });
            return false;
        }
        if ((question.type === '单选题' || question.type === '多选题') &&!question.options) {
            wx.showToast({
                title: '选项不能为空',
                icon: 'none'
            });
            return false;
        }
        if (!question.answer) {
            wx.showToast({
                title: '答案不能为空',
                icon: 'none'
            });
            return false;
        }
        return true;
    },

    onSubmitNewQuestion() {
        let { newQuestion } = this.data;
        if (newQuestion.type === '单选题' || newQuestion.type === '多选题') {
            newQuestion.options = newQuestion.options.trim();
        }
        if (!this.validateQuestion(newQuestion)) {
            return;
        }
        addNewQuestion(newQuestion).then(res => {
            wx.showToast({
                title: '题目添加成功',
                icon:'success'
            });
            this.onAddModalClose();
            this.loadQuestions();
        }).catch(error => {
            console.error('添加题目失败:', error);
            wx.showToast({
                title: '添加题目失败',
                icon: 'none'
            });
        });
    },

    onEditModalClose() {
        this.setData({
            isEditModalVisible: false
        });
    },

    onEditQuestionTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.questionTypes[index];
        this.setData({
            editQuestionTypeIndex: index,
            'editQuestion.type': type
        });
    },

    onEditQuestionInput(e) {
        this.onInputChange(e, 'editQuestion');
    },

    onSubmitEditQuestion() {
        let { editQuestion } = this.data;
        if (editQuestion.type === '单选题' || editQuestion.type === '多选题') {
            editQuestion.options = editQuestion.options.trim();
        }
        if (!this.validateQuestion(editQuestion)) {
            return;
        }

        const questionId = editQuestion.id 
        console.log(questionId);
        // 编辑题目
        updateQuestion(questionId, editQuestion).then(res => {
            wx.showToast({
                title: '题目编辑成功',
                icon:'success'
            });
            this.onEditModalClose();
            this.loadQuestions();
        }).catch(error => {
            console.error('编辑题目失败:', error);
            wx.showToast({
                title: '编辑题目失败',
                icon: 'none'
            });
        });
    }
});    