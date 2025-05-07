import {
    getOneWrongQuestion,
    apiJudgeWrongQuestion
} from "../../../api/getWrongQuestion";

Page({
    data: {
        userId:0,
        type:'',
        //  查看详情
        detailData:{},

        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        studyTime: 0, // 学习时长
        allAnswers: [], // 所有题目答案
        isSubmitted: [], // 记录每道题是否提交
        allQuestions: [], //所有题目
        selectedOptions: [], //记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {} // 存储当前题目的详细数据，用于弹窗显示
    },
    onLoad(options) {
        const type = decodeURIComponent(options.type);
        const userId1 = decodeURIComponent(options.userId);
        const userId = parseInt(userId1)
        this.setData({
            type,
            userId
        })
        console.log(type);
        console.log(userId);
        this.getData();
        // 假设这里接收学习时长，可根据实际情况修改
        this.setData({
            studyTime: 0 // 初始学习时长为0
        });
    },
    // 请求接口
    getData() {
        console.log(this.data.type);
        const type =this.data.type 
        const userId =this.data.userId 
        const data = {
            type,
            userId
        }
        getOneWrongQuestion(data).then(res => {
            console.log(res);
            res.forEach(question => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options)
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = []
                    }
                }
            })
            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                questionStates: new Array(res.length).fill(null), // 初始化题目状态数组
                selectedOptions: new Array(res.length).fill(null), // 初始化选中选项数组
                isSubmitted: new Array(res.length).fill(false) // 初始化题目提交状态数组
            })
            console.log(this.data.allQuestions);
            console.log(this.data.totalQuestions);
            console.log(this.data.allQuestions[1].options);

        })
    },
    nextQuestion: function () {
        const { currentQuestion, totalQuestions, selectedOptions } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
        }
    },
    prevQuestion: function () {
        const { currentQuestion, selectedOptions } = this.data;
        if (currentQuestion > 1) {
            this.setData({
                currentQuestion: currentQuestion - 1
            });
        }
    },
    selectOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions } = this.data;
        const newSelectedOptions = [...selectedOptions];
        const optionFirstChar = allQuestions[currentQuestion - 1].options[index][0];
        newSelectedOptions[currentQuestion - 1] = optionFirstChar;
        this.setData({
            selectedOptions: newSelectedOptions
        });
        // 打印当前选中的选项首字
        console.log(`第 ${currentQuestion} 题选中的选项首字：`, optionFirstChar);
    },
    // 多选题
    selectMultipleOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions } = this.data;

        // 确保 currentQuestion 在有效范围内
        if (currentQuestion < 1 || currentQuestion > this.data.totalQuestions) {
            return;
        }

        const newSelectedOptions = [...selectedOptions];
        const optionFirstChar = allQuestions[currentQuestion - 1].options[index][0];
        if (!Array.isArray(newSelectedOptions[currentQuestion - 1])) {
            newSelectedOptions[currentQuestion - 1] = [optionFirstChar];
        } else {
            const currentSelected = newSelectedOptions[currentQuestion - 1];
            const optionIndex = currentSelected.indexOf(optionFirstChar);
            if (optionIndex > -1) {
                currentSelected.splice(optionIndex, 1);
            } else {
                currentSelected.push(optionFirstChar);
            }
        }

        // 打印更新前的 selectedOptions
        console.log('更新前的 selectedOptions:', this.data.selectedOptions);

        this.setData({
            selectedOptions: newSelectedOptions
        }, () => {
            // 打印更新后的 selectedOptions
            console.log('更新后的 selectedOptions:', this.data.selectedOptions);
            // 检查视图层是否接收到更新后的数据
            const updatedSelectedOptions = this.data.selectedOptions;
            console.log('视图层接收到的 updatedSelectedOptions:', updatedSelectedOptions);
        });

        const selectedChars = newSelectedOptions[currentQuestion - 1] || [];
        console.log(`第 ${currentQuestion} 题选中的选项首字：`, selectedChars);
    },
    onInputAnswer: function (e) {
        const { value } = e.detail;
        const { currentQuestion, allAnswers } = this.data;
        const newAllAnswers = [...allAnswers];
        newAllAnswers[currentQuestion - 1] = value;
        this.setData({
            allAnswers: newAllAnswers
        });
    },
    /* submitSingleAnswer: function () {
        const { allQuestions, allAnswers, selectedOptions, questionStates, currentQuestion } = this.data;
        const newQuestionStates = [...questionStates];
        const newIsSubmitted = [...this.data.isSubmitted];
        const question = allQuestions[currentQuestion - 1];
        const userAnswer = allAnswers[currentQuestion - 1];
        let userAnswerToSubmit;
    
        if (question.type === '单选题' || question.type === '判断题') {
            const selectedChar = selectedOptions[currentQuestion - 1];
            userAnswerToSubmit = selectedChar || '';
        } else if (question.type === '多选题') {
            const selectedChars = selectedOptions[currentQuestion - 1] || [];
            const sortedSelectedChars = selectedChars.slice().sort();
            const sortedAnswerString = sortedSelectedChars.join('');
            userAnswerToSubmit = sortedAnswerString;
        } else if (question.type === '填空题') {
            userAnswerToSubmit = userAnswer;
        }
    
        newIsSubmitted[currentQuestion - 1] = true;
    
        this.setData({
            isSubmitted: newIsSubmitted
        });
    
        apiJudgeWrongQuestion([{
            'questionId': question.questionId,
            'answer': userAnswerToSubmit
        }])
           .then(response => {
                console.log('后端返回结果：', response);
                const result = response[0];
                const isCorrect = result.rightOrWrong === '对';
                newQuestionStates[currentQuestion - 1] = isCorrect;
                this.setData({
                    questionStates: newQuestionStates,
                    detailData: result
                }, () => {
                    // 在这里可以添加一些额外的逻辑，确保页面正确更新
                    console.log('questionStates 更新后:', this.data.questionStates);
                });
            })
           .catch(error => {
                console.error('提交答案到后端时出错：', error);
            });
    }, */

    /* showAnalysis: function () {
        const { currentQuestion, allQuestions } = this.data;
        const currentQuestionData = allQuestions[currentQuestion - 1];
        this.setData({
            showAnalysis: true,
            currentQuestionData: currentQuestionData
        });
    }, */
    /* closeAnalysisAndContinue: function () {
        this.setData({
            showAnalysis: false
        });
    }, */
    // 自定义函数，用于判断数组是否包含某个元素
    /* isArrayAndIncludes: function (arr, item) {
        return Array.isArray(arr) && arr.includes(item);
    } */
})    