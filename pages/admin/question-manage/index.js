import { getAllQuestion, addNewQuestion, deleteQuestionApi, updateQuestion, getQuestionDetail, getWrongQuestionPercent,uploadImageApi , deletePicApi } from '../../../api/admin';

Page({
    data: {
        // 正确率
        wrongQuestionPercent: '',
        questionList: [],
        pageNum: 1,
        pageSize: 10,
        searchKeyword: '',
        isLoading: false,
        totalPages: 1,
        isAddModalVisible: false,
        newQuestion: {
            type: '',
            content: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            optionT: '',
            optionF: '',
            answer: '',
            category: '',
            analysis: ''
        },
        questionTypes: ['单选题', '多选题', '填空题', '判断题'],
        newQuestionTypeIndex: 0,
        categories: ['环境保护法及配套办法', '环评与排污许可执法', '大气污染防治执法','水污染防治执法','固废污染防治执法','土壤污染防治执法','噪声污染执法','执法监测','行政执法规定','行刑衔接与损害赔偿','其他'], // 可根据实际情况修改
        isEditModalVisible: false,
        editQuestion: {
            id: '',
            type: '',
            content: '',
            options: '',
            answer: '',
            category: '',
            analysis: '',
            eh: ''
        },
        editQuestionTypeIndex: 0,
        currentCategoryIndex: 0, // 当前选中的分类索引
        currentCategory: '', // 当前选中的分类
        currentTypeIndex: 0, // 当前选中的题目类型索引
        currentType: '', // 当前选中的题目类型
        scrollTop: 0, // 添加scrollTop控制变量
    },

    onLoad(options) {
        // 添加"全部"选项到分类列表开头
        const allCategories = ['全部', ...this.data.categories];
        // 添加"全部"选项到题目类型列表开头
        const allTypes = ['全部', ...this.data.questionTypes];
        this.setData({
            categories: allCategories,
            questionTypes: allTypes
        });
        this.loadQuestions();
    },

    loadQuestions() {
        const { pageNum, pageSize, searchKeyword, currentCategory, currentType } = this.data;
        const data = {
            category: currentCategory,
            type: currentType,
            content: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        getAllQuestion(data).then(res => {
            this.setData({
                questionList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage,
                scrollTop: 0 // 重置滚动位置
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
            title: '确认禁用',
            content: '确定要禁用这道题目吗？',
            success: (res) => {
                if (res.confirm) {
                    deleteQuestionApi(questionId).then(() => {
                        wx.showToast({
                            title: '禁用成功',
                            icon: 'success'
                        });
                        this.loadQuestions();
                    }).catch(error => {
                        console.error('禁用题目失败:', error);
                        wx.showToast({
                            title: '禁用题目失败',
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

    clearSearch() {
        this.setData({
            searchKeyword: ''
        }, () => {
            this.onSearch(); // 清空后立即搜索
        });
    },

    onSearch() {
        this.setData({
            pageNum: 1 // 重置到第一页
        }, () => {
            this.loadQuestions();
            this.scrollToTop();
        });
    },

    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ 
                pageNum: pageNum + 1,
                scrollTop: 0 // 重置滚动位置
            }, () => {
                this.loadQuestions();
            });
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
            this.setData({ 
                pageNum: pageNum - 1,
                scrollTop: 0 // 重置滚动位置
            }, () => {
                this.loadQuestions();
            });
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
        getQuestionDetail(questionId).then((res) => {
            const typeIndex = this.data.questionTypes.indexOf(res.type);
            const categoryIndex = this.data.categories.indexOf(res.category);
            // 处理选项数据，将其解析为数组
            let optionsArray = [];
            if (res.options && typeof res.options ==='string') {
                try {
                    optionsArray = JSON.parse(res.options);
                } catch (error) {
                    console.log('选项解析错误：', error);
                    optionsArray = [];
                    res.options = [];
                }
            }
            // 单选题和多选题的选项处理
            if (res.type === '单选题' || res.type === '多选题') {
                let option1 = '', option2 = '', option3 = '', option4 = '';
                if (optionsArray.length >= 4) {
                    option1 = optionsArray[0].substring(2);
                    option2 = optionsArray[1].substring(2);
                    option3 = optionsArray[2].substring(2);
                    option4 = optionsArray[3].substring(2);
                }
                res.option1 = option1;
                res.option2 = option2;
                res.option3 = option3;
                res.option4 = option4;
            }
            // 判断题的选项处理
            if (res.type === '判断题') {
                let optionT = '', optionF = '';
                if (optionsArray.length >= 2) {
                    optionT = optionsArray[0].substring(2);
                    optionF = optionsArray[1].substring(2);
                }
                res.optionT = optionT;
                res.optionF = optionF;
            }
            this.setData({
                isEditModalVisible: true,
                editQuestion: {
                    id: res.questionId,
                    type: res.type,
                    content: res.content,
                    options: res.options,
                    answer: res.answer,
                    category: res.category,
                    analysis: res.analysis,
                    eh: '',
                    option1: res.option1,
                    option2: res.option2,
                    option3: res.option3,
                    option4: res.option4,
                    optionT: res.optionT,
                    optionF: res.optionF
                },
                editQuestionTypeIndex: typeIndex,
                editCategoryIndex: categoryIndex
            })
        }).catch((err) => {
            console.error('获取题目详情失败:', err);
            wx.showToast({
                title: '获取题目详情失败',
                icon: 'none'
            });
        });

        getWrongQuestionPercent(questionId).then(res => {
            if (res !== null && res !== undefined) {
                const percent = parseFloat(res);
                this.setData({
                    wrongQuestionPercent: percent.toFixed(2)
                });
            } else {
                this.setData({
                    wrongQuestionPercent: '暂无数据'
                });
            }
        }).catch(err => {
            console.error('获取正确率失败:', err);
            this.setData({
                wrongQuestionPercent: '暂无数据'
            });
        });
    },

    // 添加题目
    addQuestion() {
        this.setData({
            isAddModalVisible: true,
            newQuestion: {
                type: '',
                content: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                optionT: '',
                optionF: '',
                answer: '',
                category: '',
                analysis: ''
            },
            newQuestionTypeIndex: 0,
            newCategoryIndex: 0
        }, () => {
            this.onQuestionTypeChange({ detail: { value: 0 } });
            this.onCategoryChange({ detail: { value: 0 } });
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

    onCategoryChange(e) {
        const index = e.detail.value;
        const category = this.data.categories[index];
        this.setData({
            newCategoryIndex: index,
            'newQuestion.category': category
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
        if ((question.type === '单选题' || question.type === '多选题') && (!question.option1 ||!question.option2 ||!question.option3 ||!question.option4)) {
            wx.showToast({
                title: '选项不能为空',
                icon: 'none'
            });
            return false;
        }
        if (question.type === '判断题' && (!question.optionT ||!question.optionF)) {
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
            newQuestion.options = `["A.${newQuestion.option1}","B.${newQuestion.option2}","C.${newQuestion.option3}","D.${newQuestion.option4}"]`;
        } else if (newQuestion.type === '判断题') {
            newQuestion.options = `["T.${newQuestion.optionT}","F.${newQuestion.optionF}"]`;
        }

        if (!this.validateQuestion(newQuestion)) {
            return;
        }

        const { option1, option2, option3, option4, optionT, optionF, ...cleanedNewQuestion } = newQuestion;
        console.log('提交的新题目数据:', cleanedNewQuestion);

        addNewQuestion(cleanedNewQuestion).then(res => {
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

    onEditCategoryChange(e) {
        const index = e.detail.value;
        const category = this.data.categories[index];
        this.setData({
            editCategoryIndex: index,
            'editQuestion.category': category
        });
    },

    onEditQuestionInput(e) {
        this.onInputChange(e, 'editQuestion');
    },

    onSubmitEditQuestion() {
        let { editQuestion } = this.data;
        if (editQuestion.type === '单选题' || editQuestion.type === '多选题') {
            editQuestion.options = `["A.${editQuestion.option1}","B.${editQuestion.option2}","C.${editQuestion.option3}","D.${editQuestion.option4}"]`;
        } else if (editQuestion.type === '判断题') {
            editQuestion.options = `["T.${editQuestion.optionT}","F.${editQuestion.optionF}"]`;
        }

        if (!this.validateQuestion(editQuestion)) {
            return;
        }

        const { option1, option2, option3, option4, optionT, optionF, ...cleanedEditQuestion } = editQuestion;
        console.log('提交的编辑后题目数据:', cleanedEditQuestion);

        const questionId = cleanedEditQuestion.id;
        updateQuestion(questionId, cleanedEditQuestion).then(res => {
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
    },
    // 添加图片
    addImg() {
        // 假设正在编辑的题目 ID 作为 questionId，这里你可以根据实际情况修改获取方式
        const questionId = this.data.editQuestion.id || this.data.newQuestion.id; 
        wx.chooseImage({
            count: 1, // 一次选择一张图片
            success: (res) => {
                const filePath = res.tempFilePaths[0];
                uploadImageApi(questionId, filePath).then(res => {
                    console.log('图片上传成功', res);
                    wx.showToast({
                        title: '图片上传成功',
                        icon:'success'
                    });
                }).catch(error => {
                    console.error('图片上传失败', error);
                    wx.showToast({
                        title: '图片上传失败',
                        icon: 'none'
                    });
                });
            },
            fail: (error) => {
                console.error('选择图片失败', error);
                wx.showToast({
                    title: '选择图片失败',
                    icon: 'none'
                });
            }
        });
    },
    deletImg() {
        const pid = this.data.editQuestion.id || this.data.newQuestion.id; 

        deletePicApi(pid).then(res => {
            console.log(res);
        } )
    },
    // 分类筛选改变事件
    onFilterCategoryChange(e) {
        const index = e.detail.value;
        const category = this.data.categories[index];
        this.setData({
            currentCategoryIndex: index,
            currentCategory: category === '全部' ? '' : category,
            pageNum: 1 // 重置页码
        }, () => {
            this.loadQuestions();
            this.scrollToTop();
        });
    },

    // 题目类型筛选改变事件
    onFilterTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.questionTypes[index];
        this.setData({
            currentTypeIndex: index,
            currentType: type === '全部' ? '' : type,
            pageNum: 1 // 重置页码
        }, () => {
            this.loadQuestions();
            this.scrollToTop();
        });
    },

    // 滚动到顶部的方法
    scrollToTop() {
        // 方法1：使用选择器
        const query = wx.createSelectorQuery();
        query.select('.list-content').node().exec((res) => {
            const listContent = res[0];
            if (listContent && listContent.node) {
                listContent.node.scrollTop = 0;
            } else {
                // 方法2：使用页面滚动
                wx.pageScrollTo({
                    scrollTop: 0,
                    duration: 300
                });
            }
        });
    },
});    