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
        startTime: null,
        timer: null,
        finishedQuestionIds: []
    },
    onLoad(options) {
        const category = decodeURIComponent(options.category);
        const type = decodeURIComponent(options.questionType);

        // 重置所有状态
        this.setData({
            category,
            type,
            startTime: new Date(),
            currentQuestion: 1,
            pageNum: 1,
            questionList: [],
            selectedOptions: [],
            isSubmitted: [],
            questionStates: [],
            optionStates: [],
            finishedQuestionIds: []
        });

        // 先获取已完成的题目ID
        this.getFinashQuestionId();

        // 启动定时器，每分钟更新一次学习时长
        this.data.timer = setInterval(() => {
            const now = new Date();
            const durationInMinutes = Math.floor((now - this.data.startTime) / (1000 * 60));
            this.setData({
                studyTime: durationInMinutes
            });
        }, 60000);

        console.log('接收到的类别:', this.data.category);
        console.log('接收到的类别:', type);
    },
    loadQuestions() {
        const {
            pageNum,
            pageSize,
            finishedQuestionIds
        } = this.data;

        const data = {
            category: this.data.category,
            pageNum: pageNum,
            pageSize: pageSize,
            type: this.data.type
        };

        console.log('请求参数：', data);
        console.log('当前已完成题目ID：', finishedQuestionIds);

        getAllQuestion(data).then(res => {
            console.log('获取到的题目数据:', res);
            let newQuestionList = res.pageInfo.pageData.map(question => {
                question.questionId = question.question_id;
                if (question.options) {
                    try {
                        question.options = JSON.parse(question.options);
                    } catch (error) {
                        console.error('解析options失败:', error);
                    }
                }
                return question;
            });

            // 过滤掉已完成的题目
            newQuestionList = newQuestionList.filter(question => 
                !finishedQuestionIds.includes(question.questionId)
            );

            console.log('过滤后的题目列表:', newQuestionList);

            // 如果过滤后没有题目了，显示提示并重新开始
            if (newQuestionList.length === 0) {
                wx.showModal({
                    title: '提示',
                    content: '所有题目已完成，是否重新开始？',
                    success: (res) => {
                        if (res.confirm) {
                            // 清空已完成题目ID，重新加载所有题目
                            this.setData({
                                finishedQuestionIds: [],
                                pageNum: 1,
                                questionList: [],
                                selectedOptions: [],
                                isSubmitted: [],
                                questionStates: [],
                                optionStates: []
                            }, () => {
                                // 重新获取所有题目
                                this.loadQuestions();
                            });
                        }
                    }
                });
                return;
            }

            // 重置当前题目列表，而不是追加
            const initialOptionStates = newQuestionList.map(question =>
                new Array(question.options ? question.options.length : 0).fill(false)
            );

            const newSelectedOptions = new Array(newQuestionList.length).fill(null);
            const newIsSubmitted = new Array(newQuestionList.length).fill(false);
            const newQuestionStates = new Array(newQuestionList.length).fill(null);

            this.setData({
                questionList: newQuestionList,
                totalQuestions: newQuestionList.length,
                currentQuestion: 1, // 重置当前题目为第一题
                questionStates: newQuestionStates,
                selectedOptions: newSelectedOptions,
                isSubmitted: newIsSubmitted,
                optionStates: initialOptionStates
            }, () => {
                console.log('更新后的题目列表:', this.data.questionList);
                console.log('当前题目总数:', this.data.totalQuestions);
                console.log('当前题目:', this.data.currentQuestion);
            });
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
        console.log('获取已完成题目ID参数：', data);
        return getFinashQuestionId(data).then(res => {
            console.log('已完成的题目ID：', res);
            // 确保res是数组
            const finishedIds = Array.isArray(res) ? res : [];
            this.setData({
                finishedQuestionIds: finishedIds
            }, () => {
                // 获取到已完成题目ID后重新加载题目
                this.loadQuestions();
            });
        });
    },
    nextQuestion: function () {
        const {
            currentQuestion,
            totalQuestions
        } = this.data;
        
        console.log('当前题目:', currentQuestion, '总题目数:', totalQuestions);
        
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            }, () => {
                console.log('切换到下一题:', this.data.currentQuestion);
            });
        } else {
            wx.showToast({
                title: '已经是最后一题',
                icon: 'none'
            });
        }
    },
    prevQuestion: function () {
        const {
            currentQuestion
        } = this.data;
        
        console.log('当前题目:', currentQuestion);
        
        if (currentQuestion > 1) {
            this.setData({
                currentQuestion: currentQuestion - 1
            }, () => {
                console.log('切换到上一题:', this.data.currentQuestion);
            });
        } else {
            wx.showToast({
                title: '已经是第一题',
                icon: 'none'
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

            // 检查是否所有题目都已完成
            const allCompleted = newIsSubmitted.every(submitted => submitted);
            if (allCompleted) {
                wx.showModal({
                    title: '提示',
                    content: '所有题目已完成，是否重新开始？',
                    success: (res) => {
                        if (res.confirm) {
                            // 清空已完成题目ID，重新加载所有题目
                            this.setData({
                                finishedQuestionIds: [],
                                pageNum: 1
                            }, () => {
                                // 重新获取所有题目
                                this.loadQuestions();
                            });
                        }
                    }
                });
            }

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
            startTime,
            timer,
            studyTime
        } = this.data;
        const endTime = new Date();
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        
        // 打印详细的时间信息
        console.log('学习时间统计：', {
            '开始时间': startTime.toLocaleString(),
            '结束时间': endTime.toLocaleString(),
            '总学习时长(分钟)': durationInMinutes,
            '页面显示时长(分钟)': studyTime
        });

        // 清除定时器
        if (timer) {
            clearInterval(timer);
        }

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
            console.log('学习时间上传结果：', res);
        });
    }
});