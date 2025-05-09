import {
    getAllQuestion
} from '../../../api/admin'
import {
    apiJudgeTest
} from '../../../api/judgeTest'
import {
    addLearnTime
} from '../../../api/addLearnTime'

import {getFinashQuestionId} from '../../../api/getFinashQuestionId'
Page({
    data: {
        currentQuestion: 1,
        totalPages: 0,
        pageNum: 1,
        pageSize: 100,
        type: '',
        category: '',
        questionTypes: ['单选', '多选', '填空'],
        detailData: {},
        totalQuestions: 0,
        studyTime: 0,
        allAnswers: [],
        isSubmitted: [],
        questionList: [],
        selectedOptions: [],
        questionStates: [],
        showAnalysis: false,
        currentQuestionData: {},
        optionStates: [],
        startTime: null
    },
    onLoad(options) {
        const category = decodeURIComponent(options.category);
        const type = decodeURIComponent(options.questionType);

        // 尝试从本地存储中读取保存的状态
        try {
            const savedCurrentQuestion = wx.getStorageSync('savedCurrentQuestion');
            const savedSelectedOptions = wx.getStorageSync('savedSelectedOptions');
            const savedIsSubmitted = wx.getStorageSync('savedIsSubmitted');
            const savedQuestionStates = wx.getStorageSync('savedQuestionStates');
            const savedOptionStates = wx.getStorageSync('savedOptionStates');

            console.log('读取到的保存数据：', {
                savedCurrentQuestion,
                savedSelectedOptions,
                savedIsSubmitted,
                savedQuestionStates,
                savedOptionStates
            });

            this.setData({
                category,
                type,
                startTime: new Date(),
                currentQuestion: savedCurrentQuestion || 1,
                selectedOptions: savedSelectedOptions || [],
                isSubmitted: savedIsSubmitted || [],
                questionStates: savedQuestionStates || [],
                optionStates: savedOptionStates || []
            });
        } catch (error) {
            console.error('读取本地存储数据时出错：', error);
        }

        console.log('接收到的类别:', this.data.category);
        console.log('接收到的类别:', type);
        this.loadQuestions();
        this.getFinashQuestionId()
    },
    loadQuestions() {
        const {
            pageNum,
            pageSize
        } = this.data;
        const data = {
            category: this.data.category,
            pageNum: pageNum,
            pageSize: pageSize,
            type: this.data.type
        };

        console.log('请求参数：', data);

        getAllQuestion(data).then(res => {
            console.log('获取到的题目数据:', res);
            const newQuestionList = res.pageInfo.pageData.map(question => {
                question.questionId = question.question_id;
                if (question.options) {
                    try {
                        question.options = JSON.parse(question.options);
                    } catch (error) {
                        console.error('解析options失败:', error);
                    }
                }
                // console.log('单个题目数据:', question);
                return question;
            });

            const currentQuestionList = this.data.questionList;
            const combinedQuestionList = currentQuestionList.concat(newQuestionList);

            const initialOptionStates = newQuestionList.map(question =>
                new Array(question.options? question.options.length : 0).fill(false)
            );

            // 避免覆盖已有的状态数据
            const {
                selectedOptions,
                isSubmitted,
                questionStates,
                optionStates
            } = this.data;
            const newSelectedOptions = [...selectedOptions];
            const newIsSubmitted = [...isSubmitted];
            const newQuestionStates = [...questionStates];
            const newOptionStates = [...optionStates, ...initialOptionStates];

            this.setData({
                questionList: combinedQuestionList,
                totalQuestions: res.pageInfo.totalSize,
                questionStates: newQuestionStates,
                selectedOptions: newSelectedOptions,
                isSubmitted: newIsSubmitted,
                pageNum: this.data.pageNum + 1,
                optionStates: newOptionStates
            });

            console.log('设置到data中的题目数据:', this.data.questionList);
            console.log('当前题目总数:', this.data.totalQuestions);
        }).catch(err => {
            console.error('加载题目列表失败:', err);
            wx.showToast({
                title: '加载题目列表失败',
                icon: 'none'
            });
        });
    },
    // 获取已完成id
    getFinashQuestionId() {
        const data = {
            type: this.data.type,
            category: this.data.category
        }
        console.log(data);
        getFinashQuestionId(data).then(res => {
            console.log(res);
        })
    },
    nextQuestion: function () {
        const {
            currentQuestion,
            totalQuestions,
            questionList
        } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
            if (currentQuestion + 1 >= questionList.length - 2) {
                this.loadQuestions();
            }
        }
    },
    prevQuestion: function () {
        const {
            currentQuestion
        } = this.data;
        if (currentQuestion > 1) {
            this.setData({
                currentQuestion: currentQuestion - 1
            });
        }
    },
    selectOption: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            questionList
        } = this.data;
        const newSelectedOptions = [...selectedOptions];
        const question = questionList[currentQuestion - 1];
        if (question && question.options) {
            const optionFirstChar = question.options[index][0];
            newSelectedOptions[currentQuestion - 1] = optionFirstChar;
            this.setData({
                selectedOptions: newSelectedOptions
            });
            console.log(`第 ${currentQuestion} 题选中的选项首字：`, optionFirstChar);
        } else {
            console.error('当前题目数据不存在或选项数据不完整');
        }
    },
    selectMultipleOption: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            questionList,
            optionStates
        } = this.data;
        if (!questionList ||!questionList[currentQuestion - 1] ||!questionList[currentQuestion - 1].options) {
            console.error('题目数据不完整');
            return;
        }
        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        currentOptionStates[index] =!currentOptionStates[index];
        let currentSelected = [];
        currentOptionStates.forEach((isSelected, idx) => {
            if (isSelected && questionList[currentQuestion - 1].options[idx]) {
                currentSelected.push(questionList[currentQuestion - 1].options[idx][0]);
            }
        });
        currentSelected.sort();
        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[currentQuestion - 1] = currentSelected;
        const newOptionStates = [...optionStates];
        newOptionStates[currentQuestion - 1] = currentOptionStates;
        this.setData({
            selectedOptions: newSelectedOptions,
            optionStates: newOptionStates,
            [`answerSheetStates[${currentQuestion - 1}]`]: true
        }, () => {
            console.log('更新后的状态：', {
                currentQuestion,
                selectedOptions: this.data.selectedOptions[currentQuestion - 1],
                optionStates: this.data.optionStates[currentQuestion - 1]
            });
        });
    },
    onInputAnswer: function (e) {
        const {
            value
        } = e.detail;
        const {
            currentQuestion,
            allAnswers
        } = this.data;
        const newAllAnswers = [...allAnswers];
        newAllAnswers[currentQuestion - 1] = value;
        this.setData({
            allAnswers: newAllAnswers
        });
    },
    submitSingleAnswer: function () {
        const {
            questionList,
            allAnswers,
            selectedOptions,
            questionStates,
            currentQuestion
        } = this.data;
        const newQuestionStates = [...questionStates];
        const newIsSubmitted = [...this.data.isSubmitted];
        const question = questionList[currentQuestion - 1];
        if (!question) {
            console.error('当前题目数据不存在，currentQuestion 可能越界:', currentQuestion);
            return;
        }
        if (!question.questionId) {
            console.error('当前题目缺少questionId:', question);
            return;
        }
        const userAnswer = allAnswers[currentQuestion - 1];
        const questionId = question.questionId;
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
            userAnswerToSubmit = userAnswer || '';
        }
        const data = [{
            questionId: questionId,
            answer: userAnswerToSubmit,
            type: this.data.type
        }];
        console.log('提交到后端的数据：', data);
        apiJudgeTest(data).then(res => {
            console.log('后端返回结果：', res);
            newQuestionStates[currentQuestion - 1] = res[0].rightOrWrong === '对';
            newIsSubmitted[currentQuestion - 1] = true;
            this.setData({
                questionStates: newQuestionStates,
                isSubmitted: newIsSubmitted,
                detailData: res[0]
            });
            console.log(this.data.detailData);
        }).catch(error => {
            console.error('提交答案到后端时出错：', error);
        });
    },
    showAnalysis: function () {
        const {
            currentQuestion,
            questionList
        } = this.data;
        const currentQuestionData = questionList[currentQuestion - 1];
        this.setData({
            showAnalysis: true,
            currentQuestionData: currentQuestionData
        });
    },
    closeAnalysisAndContinue: function () {
        this.setData({
            showAnalysis: false
        });
    },
    onUnload: function () {
        const {
            currentQuestion,
            selectedOptions,
            isSubmitted,
            questionStates,
            optionStates,
            startTime
        } = this.data;
        const endTime = new Date();
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        console.log(`做题总时间（分钟）：${durationInMinutes}`);

        try {
            // 保存当前题目序号和其他状态数据
            wx.setStorageSync('savedCurrentQuestion', currentQuestion);
            wx.setStorageSync('savedSelectedOptions', selectedOptions);
            wx.setStorageSync('savedIsSubmitted', isSubmitted);
            wx.setStorageSync('savedQuestionStates', questionStates);
            wx.setStorageSync('savedOptionStates', optionStates);
            console.log('数据已成功保存到本地存储');
        } catch (error) {
            console.error('保存数据到本地存储时出错：', error);
        }

        addLearnTime(durationInMinutes).then(res => {
            console.log(res);
        });
    }
});