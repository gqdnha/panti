import {
    getAllQuestion
} from '../../../api/admin'
import {
    apiJudgeTest
} from '../../../api/judgeTest'
import {
    addLearnTime
} from '../../../api/addLearnTime'

import {
    getFinashQuestionId
} from '../../../api/getFinashQuestionId'
import {
    judgeTopicalTest,
    getFinashAnswer,
    deleteAnswerHistory
} from '../../../api/topical.js'
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
        finishedQuestionIds: [],
        isAllFinished: false,
        noData: false,
        showImagePreview: false,
        currentPreviewImage: '',
        scale: 1,
        baseScale: 1,
        transition: '',
        startDistance: 0,
        parsedImageList: [],
        showAnswerCard: false,
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
            finishedQuestionIds: [],
            isAllFinished: false
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

        this.loadQuestions();
    },
    // 获取已完成
    getFinashAnswer() {
        const data = {
            category: this.data.category,
            type: this.data.type,
        };
        getFinashAnswer(data).then(res => {
            console.log('已完成题目：', res);
            if (res && res.length > 0) {
                // 将已完成的题目数据合并到题目列表中
                const newQuestionList = this.data.questionList.map(question => {
                    const completedQuestion = res.find(cq => cq.questionId === question.questionId);
                    if (completedQuestion) {
                        console.log('找到已完成的题目：', completedQuestion);
                        return {
                            ...question,
                            isSubmitted: true,
                            isFinished: true,
                            userAnswer: completedQuestion.oldAnswer,
                            rightOrWrong: completedQuestion.rightOrWrong,
                            analysis: completedQuestion.analysis,
                            answer: completedQuestion.answer
                        };
                    }
                    return question;
                });
                
                console.log('更新后的题目列表：', newQuestionList);
                
                // 更新题目列表和状态
                const newIsSubmitted = newQuestionList.map(q => q.isSubmitted || false);
                const newQuestionStates = newQuestionList.map(q => q.rightOrWrong === '对');
                const newSelectedOptions = newQuestionList.map(q => q.userAnswer || null);
                
                // 设置当前题目的detailData
                const currentQuestion = newQuestionList[this.data.currentQuestion - 1];
                if (currentQuestion && currentQuestion.isSubmitted) {
                    const detailData = {
                        answer: currentQuestion.answer,
                        analysis: currentQuestion.analysis,
                        rightOrWrong: currentQuestion.rightOrWrong,
                        oldAnswer: currentQuestion.userAnswer
                    };
                    console.log('设置当前题目的detailData:', detailData);
                    
                    // 先设置detailData
                    this.setData({
                        detailData: detailData
                    }, () => {
                        // 然后设置其他数据
                        this.setData({
                            questionList: newQuestionList,
                            isSubmitted: newIsSubmitted,
                            questionStates: newQuestionStates,
                            selectedOptions: newSelectedOptions
                        }, () => {
                            console.log('数据更新完成：', {
                                currentQuestion: this.data.currentQuestion,
                                currentQuestionData: this.data.questionList[this.data.currentQuestion - 1],
                                isSubmitted: this.data.isSubmitted[this.data.currentQuestion - 1],
                                questionStates: this.data.questionStates[this.data.currentQuestion - 1],
                                selectedOptions: this.data.selectedOptions[this.data.currentQuestion - 1],
                                detailData: this.data.detailData
                            });
                        });
                    });
                } else {
                    // 如果当前题目未完成，只更新其他数据
                    this.setData({
                        questionList: newQuestionList,
                        isSubmitted: newIsSubmitted,
                        questionStates: newQuestionStates,
                        selectedOptions: newSelectedOptions
                    }, () => {
                        console.log('数据更新完成：', {
                            currentQuestion: this.data.currentQuestion,
                            currentQuestionData: this.data.questionList[this.data.currentQuestion - 1],
                            isSubmitted: this.data.isSubmitted[this.data.currentQuestion - 1],
                            questionStates: this.data.questionStates[this.data.currentQuestion - 1],
                            selectedOptions: this.data.selectedOptions[this.data.currentQuestion - 1],
                            detailData: this.data.detailData
                        });
                    });
                }
            }
        });
    },

    // 加载题目
    loadQuestions() {
        const {
            pageNum,
            pageSize,
            finishedQuestionIds,
            isAllFinished,
        } = this.data;

        const data = {
            category: this.data.category,
            pageNum: pageNum,
            pageSize: pageSize,
            type: this.data.type
        };

        getAllQuestion(data).then(res => {
            console.log('获取到的题目数据:', res);
            
            // 检查是否有数据
            if (!res.pageInfo.pageData || res.pageInfo.pageData.length === 0) {
                this.setData({
                    noData: true,
                    totalQuestions: 0
                });
                return;
            }

            // 有数据时重置noData状态
            this.setData({
                noData: false
            });

            let newQuestionList = res.pageInfo.pageData.map(question => {
                question.questionId = question.question_id;
                // 标记已完成的题目
                question.isFinished = finishedQuestionIds.includes(question.questionId);
                if (question.options) {
                    try {
                        question.options = JSON.parse(question.options);
                    } catch (error) {
                        console.error('解析options失败:', error);
                    }
                }
                return question;
            });

            // 如果全部完成，显示所有题目
            if (isAllFinished) {
                this.setQuestionList(newQuestionList);
                // 获取已完成题目的详情
                this.getFinashAnswer();
                return;
            }

            // 第一次做时，过滤掉已完成的题目
            newQuestionList = newQuestionList.filter(question => !question.isFinished);

            // 如果过滤后没有题目了，说明全部完成
            if (newQuestionList.length === 0) {
                this.setData({
                    isAllFinished: true
                }, () => {
                    // 重新加载所有题目
                    this.loadQuestions();
                });
                return;
            }

            this.setQuestionList(newQuestionList);
            // 获取已完成题目的详情
            this.getFinashAnswer();
        }).catch(err => {
            console.error('加载题目列表失败:', err);
            this.setData({
                noData: true
            });
            wx.showToast({
                title: '加载题目列表失败',
                icon: 'none'
            });
        });
    },
    // 设置题目列表的辅助函数
    setQuestionList(newQuestionList) {
        const initialOptionStates = newQuestionList.map(question =>
            new Array(question.options ? question.options.length : 0).fill(false)
        );

        // 解析每个题目的图片列表
        const parsedImageList = newQuestionList.map(question => {
            if (question.if_picture && question.image_list_json) {
                try {
                    // 确保 image_list_json 是字符串
                    const imageListStr = typeof question.image_list_json === 'string' 
                        ? question.image_list_json 
                        : JSON.stringify(question.image_list_json);
                    const imageList = JSON.parse(imageListStr);
                    // 过滤掉没有 image_url 的项
                    return imageList.filter(img => img && img.image_url && img.image_url !== 'null');
                } catch (error) {
                    console.error('解析图片列表失败:', error, question.image_list_json);
                    return [];
                }
            }
            return [];
        });

        const newSelectedOptions = new Array(newQuestionList.length).fill(null);
        const newIsSubmitted = this.data.isAllFinished ? 
            new Array(newQuestionList.length).fill(false) : 
            newQuestionList.map(question => question.isFinished);
        const newQuestionStates = new Array(newQuestionList.length).fill(null);

        // 如果是全部完成后显示所有题目，清除detailData
        if (this.data.isAllFinished) {
            this.setData({
                detailData: {}
            });
        }

        this.setData({
            questionList: newQuestionList,
            totalQuestions: newQuestionList.length,
            currentQuestion: 1,
            questionStates: newQuestionStates,
            selectedOptions: newSelectedOptions,
            isSubmitted: newIsSubmitted,
            optionStates: initialOptionStates,
            parsedImageList: parsedImageList
        }, () => {
            console.log('更新后的题目列表:', this.data.questionList);
            console.log('解析后的图片列表:', this.data.parsedImageList);
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

            // 先获取所有题目数量
            getAllQuestion({
                category: this.data.category,
                pageNum: 1,
                pageSize: 100,
                type: this.data.type
            }).then(allRes => {
                const totalQuestions = allRes.pageInfo.totalSize;
                console.log('总题目数：', totalQuestions, '已完成题目数：', finishedIds.length);

                // 如果已完成题目数等于总题目数，说明全部完成
                const isAllFinished = finishedIds.length === totalQuestions;

                this.setData({
                    finishedQuestionIds: finishedIds,
                    isAllFinished: isAllFinished
                }, () => {
                    // 获取到已完成题目ID后重新加载题目
                    this.loadQuestions();
                });
            });
        });
    },
    nextQuestion: function () {
        const {
            currentQuestion,
            totalQuestions,
            questionList
        } = this.data;

        console.log('当前题目:', currentQuestion, '总题目数:', totalQuestions);

        if (currentQuestion < totalQuestions) {
            const nextQuestion = questionList[currentQuestion];
            if (nextQuestion && nextQuestion.isSubmitted) {
                const detailData = {
                    answer: nextQuestion.answer,
                    analysis: nextQuestion.analysis,
                    rightOrWrong: nextQuestion.rightOrWrong,
                    oldAnswer: nextQuestion.userAnswer
                };
                console.log('切换到下一题，设置detailData:', detailData);
                this.setData({
                    detailData: detailData
                });
            }
            
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
            currentQuestion,
            questionList
        } = this.data;

        console.log('当前题目:', currentQuestion);

        if (currentQuestion > 1) {
            const prevQuestion = questionList[currentQuestion - 2];
            if (prevQuestion && prevQuestion.isSubmitted) {
                const detailData = {
                    answer: prevQuestion.answer,
                    analysis: prevQuestion.analysis,
                    rightOrWrong: prevQuestion.rightOrWrong,
                    oldAnswer: prevQuestion.userAnswer
                };
                console.log('切换到上一题，设置detailData:', detailData);
                this.setData({
                    detailData: detailData
                });
            }
            
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
        if (!questionList || !questionList[currentQuestion - 1] || !questionList[currentQuestion - 1].options) {
            console.error('题目数据不完整');
            return;
        }
        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        currentOptionStates[index] = !currentOptionStates[index];
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
            currentQuestion,
            isAllFinished,
            startTime,
            isSubmitted
        } = this.data;
        const newQuestionStates = [...questionStates];
        const newIsSubmitted = [...isSubmitted];
        const question = questionList[currentQuestion - 1];

        if (!question) {
            console.error('当前题目数据不存在，currentQuestion 可能越界:', currentQuestion);
            return;
        }
        if (!question.questionId) {
            console.error('当前题目缺少questionId:', question);
            return;
        }

        // 检查当前题目是否已提交
        if (isSubmitted[currentQuestion - 1]) {
            wx.showToast({
                title: '该题目已提交',
                icon: 'none'
            });
            return;
        }

        // 验证是否已选择答案
        if (question.type === '单选题' || question.type === '判断题') {
            const selectedChar = selectedOptions[currentQuestion - 1];
            if (!selectedChar) {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none'
                });
                return;
            }
        } else if (question.type === '多选题') {
            const selectedChars = selectedOptions[currentQuestion - 1] || [];
            if (selectedChars.length === 0) {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none'
                });
                return;
            }
        } else if (question.type === '填空题') {
            const userAnswer = allAnswers[currentQuestion - 1];
            if (!userAnswer || userAnswer.trim() === '') {
                wx.showToast({
                    title: '请输入答案',
                    icon: 'none'
                });
                return;
            }
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
            type: this.data.type,
            category: this.data.category
        }];
        console.log('提交到后端的数据：', data);
        judgeTopicalTest(data).then(res => {
            console.log('后端返回结果：', res);
            // 强制将answer处理为大写字母字符串
            if (res[0].answer) {
                res[0].answer = String(res[0].answer).replace(/[^A-Z]/ig, '').toUpperCase();
            }
            newQuestionStates[currentQuestion - 1] = res[0].rightOrWrong === '对';
            newIsSubmitted[currentQuestion - 1] = true;

            // 更新题目的完成状态
            const newQuestionList = [...questionList];
            newQuestionList[currentQuestion - 1].isFinished = true;
            newQuestionList[currentQuestion - 1].isSubmitted = true;
            newQuestionList[currentQuestion - 1].userAnswer = userAnswerToSubmit;
            newQuestionList[currentQuestion - 1].rightOrWrong = res[0].rightOrWrong;
            newQuestionList[currentQuestion - 1].analysis = res[0].analysis;
            newQuestionList[currentQuestion - 1].answer = res[0].answer;

            this.setData({
                questionStates: newQuestionStates,
                isSubmitted: newIsSubmitted,
                detailData: res[0],
                questionList: newQuestionList
            });

            // 检查是否所有题目都已完成
            const allCompleted = newIsSubmitted.every(submitted => submitted);
            if (allCompleted && !isAllFinished) {
                this.setData({
                    isAllFinished: true
                }, () => {
                    wx.showModal({
                        title: '提示',
                        content: '所有题目已完成',
                        showCancel: false,
                        success: () => {
                            // 重新加载所有题目
                            this.loadQuestions();
                        }
                    });
                });
            }
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
            console.log('学习时间上传结果：', durationInMinutes);
            console.log('学习时间上传结果：', typeof durationInMinutes);
        });
    },
    // 图片预览相关方法
    previewImage: function(e) {
        const url = e.currentTarget.dataset.url;
        this.setData({
            showImagePreview: true,
            currentPreviewImage: url,
            scale: 1,
            transition: ''
        });
    },

    closeImagePreview: function() {
        this.setData({
            showImagePreview: false,
            currentPreviewImage: '',
            scale: 1,
            transition: ''
        });
    },

    // 处理缩放开始
    touchStart: function(e) {
        if (e.touches.length === 2) {
            const xMove = e.touches[1].clientX - e.touches[0].clientX;
            const yMove = e.touches[1].clientY - e.touches[0].clientY;
            const distance = Math.sqrt(xMove * xMove + yMove * yMove);
            this.setData({
                startDistance: distance,
                baseScale: this.data.scale,
                transition: ''
            });
        }
    },

    // 处理缩放过程
    touchMove: function(e) {
        if (e.touches.length === 2) {
            const xMove = e.touches[1].clientX - e.touches[0].clientX;
            const yMove = e.touches[1].clientY - e.touches[0].clientY;
            const distance = Math.sqrt(xMove * xMove + yMove * yMove);
            
            let scale = this.data.baseScale * (distance / this.data.startDistance);
            scale = Math.max(0.5, Math.min(4, scale));
            
            this.setData({ scale });
        }
    },

    // 处理缩放结束
    touchEnd: function() {
        this.setData({
            transition: 'transform 0.3s ease-in-out'
        });
        
        if (this.data.scale < 1) {
            this.setData({
                scale: 1
            });
        }
    },

    stopPropagation: function(e) {
        e.stopPropagation();
    },

    // 显示答题卡
    showAnswerCard() {
        this.setData({
            showAnswerCard: true
        });
    },

    // 关闭答题卡
    closeAnswerCard() {
        this.setData({
            showAnswerCard: false
        });
    },

    // 跳转到指定题目
    jumpToQuestion(e) {
        const index = e.currentTarget.dataset.index;
        this.setData({
            currentQuestion: index,
            showAnswerCard: false
        });
    },
});