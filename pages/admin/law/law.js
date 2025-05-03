import { getAllQuestion, addNewQuestion, deleteQuestionApi, updateQuestion, getQuestionDetail ,getWrongQuestionPercent } from '../../../api/admin';

Page({
    data: { 
        newLaw:'',
        isEditModalVisible: false,
    },

    onLoad(options) {
        // this.loadQuestions();
    },


    // 删除法律（修改）
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
                analysis: '',
                eh:''
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

    // 添加 提交
    onSubmitNewQuestion() {
        let { newQuestion } = this.data;
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
});    