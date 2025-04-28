import {
    apiGetDailyTest
} from "../../../api/getDailyTest";
import { apiJudgeTest } from  "../../../api/judgeTest"

Page({
    data: {
        currentQuestion: 1,
        totalQuestions: 0,
        remainingTime: '20:00',
        currentQuestionData: null,
        answer: '',
        showAnalysis: false,
        isCorrect: false,
        timer: null,
        questions: [],
        touchStartX: 0,
        touchEndX: 0,
        isSubmitted: false,
        isAllSubmitted: false,
        allAnswers: [],
        selectedOptions: [], // 记录每个题目的选中选项
        questionStates: [] // 记录每个题目的答题状态（正确/错误）
    },

    onLoad: function () {
        this.startCountdown();
        this.fetchQuestions();
    },

    onUnload: function () {
        this.clearCountdown();
    },

    // 获取题目数据
    fetchQuestions: function () {
        apiGetDailyTest().then(res => {
            console.log(res, '111');
            if (res && Array.isArray(res)) {
                const newQuestions = res;
                const hasInvalidData = this.validateQuestions(newQuestions);
                if (hasInvalidData) {
                    wx.showToast({
                        title: '数据格式错误，请联系管理员',
                        icon: 'none'
                    });
                    return;
                }

                // 解析选项
                newQuestions.forEach(question => {
                    if (question.options && typeof question.options === 'string') {
                        try {
                            question.options = JSON.parse(question.options);
                        } catch (error) {
                            console.log('选项解析错误：', error);
                            question.options = [];
                        }
                    }
                });

                this.setData({
                    questions: newQuestions,
                    totalQuestions: newQuestions.length,
                    currentQuestionData: newQuestions[0],
                    allAnswers: new Array(newQuestions.length).fill(''),
                    selectedOptions: new Array(newQuestions.length).fill(null), // 初始化选中选项数组
                    questionStates: new Array(newQuestions.length).fill(null) // 初始化题目状态数组
                }, () => {
                    this.loadQuestion(this.data.currentQuestion);
                });
            } else {
                console.error('接口返回数据格式不正确', res);
                wx.showToast({
                    title: '数据格式错误，请联系管理员',
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.error('获取每日测试数据失败', err);
            wx.showToast({
                title: '获取数据失败，请稍后重试',
                icon: 'none'
            });
        });
    },

    // 验证题目数据
    validateQuestions: function (questions) {
        let hasInvalidData = false;
        const requiredProps = ['questionId', 'type', 'content', 'options', 'answer'];
        questions.forEach(question => {
            requiredProps.forEach(prop => {
                if (!question.hasOwnProperty(prop)) {
                    console.error(`数据项缺失属性: ${prop}`, question);
                    hasInvalidData = true;
                }
            });
            try {
                if (question.options && typeof question.options === 'string') {
                    JSON.parse(question.options);
                }
            } catch (error) {
                console.error('选项数据格式错误', question);
                hasInvalidData = true;
            }
        });
        return hasInvalidData;
    },

    // 开始倒计时
    startCountdown: function () {
        this.clearCountdown();
        let remainingSeconds = 1200;
        this.data.timer = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
                const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
                this.setData({
                    remainingTime: `${minutes}:${seconds}`
                });
            } else {
                this.clearCountdown();
                this.submitAllAnswers();
            }
        }, 1000);
    },

    // 清除倒计时
    clearCountdown: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
    },

    // 上一题
    prevQuestion: function () {
        if (this.data.currentQuestion > 1) {
            const prevQuestionIndex = this.data.currentQuestion - 1;
            const prevQuestion = this.data.questions[prevQuestionIndex - 1];

            const records = wx.getStorageSync('answerRecords') || [];
            const record = records.find(r => r.questionId === prevQuestion.questionId);

            let answer = '';
            let isCorrect = false;
            let isSubmitted = false;
            let selectedOptions = [];

            if (record) {
                answer = record.answer;
                isCorrect = record.isCorrect;
                isSubmitted = record.isSubmitted;
                selectedOptions = record.options || [];
            }

            // 设置上一题选项的选中状态
            const options = this.parseOptions(prevQuestion);
            const updatedOptions = this.setSelectedOptions(options, selectedOptions);

            this.setData({
                currentQuestion: prevQuestionIndex,
                showAnalysis: false,
                answer,
                isCorrect,
                isSubmitted,
                'currentQuestionData.options': updatedOptions,
                currentQuestionData: prevQuestion
            }, () => {
                console.log('上一题数据更新完成', this.data.currentQuestionData, this.data.answer);
            });
        }
    },

    // 下一题
    nextQuestion: function () {
        if (this.data.currentQuestion < this.data.totalQuestions) {
            this.setData({
                currentQuestion: this.data.currentQuestion + 1,
                showAnalysis: false
            }, () => {
                this.loadQuestion(this.data.currentQuestion);
            });
        }
    },

    // 设置选项的选中状态
    setSelectedOptions: function (options, recordOptions) {
        if (recordOptions) {
            return options.map(option => {
                const selected = recordOptions.some(o => o.label === option.label && o.selected);
                return {
                   ...option,
                    selected
                };
            });
        }
        return options.map(option => ({
           ...option,
            selected: false
        }));
    },

    // 加载题目
    loadQuestion: function (questionIndex) {
        const question = this.data.questions[questionIndex - 1];
        if (question) {
            try {
                const records = wx.getStorageSync('answerRecords') || [];
                const record = records.find(r => r.questionId === question.questionId);
                const options = this.parseOptions(question);
                let selectedOptions = [];

                if (record) {
                    selectedOptions = record.options || [];
                    this.setData({
                        answer: record.answer,
                        isCorrect: record.isCorrect,
                        isSubmitted: record.isSubmitted,
                        'currentQuestionData.options': this.setSelectedOptions(options, selectedOptions)
                    }, () => {
                        this.setData({
                            currentQuestionData: question
                        }, () => {
                            this.setData({
                                answer: this.data.allAnswers[questionIndex - 1]
                            }, () => {
                                console.log('loadQuestion 数据更新完成', this.data.currentQuestionData, this.data.answer);
                            });
                        });
                    });
                } else {
                    this.setData({
                        answer: '',
                        isCorrect: false,
                        isSubmitted: false,
                        'currentQuestionData.options': options
                    }, () => {
                        this.setData({
                            currentQuestionData: question
                        }, () => {
                            this.setData({
                                answer: this.data.allAnswers[questionIndex - 1]
                            }, () => {
                                console.log('loadQuestion 数据更新完成', this.data.currentQuestionData, this.data.answer);
                            });
                        });
                    });
                }
            } catch (error) {
                console.error('加载题目数据时出错', error);
                wx.showToast({
                    title: '题目数据加载失败，请稍后重试',
                    icon: 'none'
                });
            }
        }
    },

    // 解析选项
    parseOptions: function (question) {
        return question.options.map((option, index) => ({
            label: String.fromCharCode(65 + index) + '.',
            content: option,
            selected: false
        }));
    },

    // 选择单选题选项
    selectOption: function (e) {
        const index = e.currentTarget.dataset.index;
        const options = this.setSelectedOption(this.data.currentQuestionData.options, index);
        const answer = options[index].label;
        this.setData({
            'currentQuestionData.options': options,
            answer
        });
        this.updateAnswer(this.data.currentQuestion - 1, answer);
    },

    // 设置单选题选项的选中状态
    setSelectedOption: function (options, index) {
        return options.map((item, i) => {
            return {
               ...item,
                selected: i === index
            };
        });
    },

    // 选择多选题选项
    selectMultipleOption: function (e) {
        const index = e.currentTarget.dataset.index;
        const options = this.toggleSelectedOption(this.data.currentQuestionData.options, index);
        const selectedOptions = options
           .filter(item => item.selected)
           .map(item => item.label)
           .join('');
        this.setData({
            'currentQuestionData.options': options,
            answer: selectedOptions
        });
        this.updateAnswer(this.data.currentQuestion - 1, selectedOptions);
    },

    // 切换多选题选项的选中状态
    toggleSelectedOption: function (options, index) {
        return options.map((item, i) => {
            if (i === index) {
                return {
                   ...item,
                    selected: !item.selected
                };
            }
            return item;
        });
    },

    // 选择判断题答案
    selectJudge: function (e) {
        const value = e.currentTarget.dataset.value;
        this.setData({
            answer: value
        });
        this.updateAnswer(this.data.currentQuestion - 1, value);
    },

    // 填空题输入答案
    onInputAnswer: function (e) {
        const answer = e.detail.value;
        this.setData({
            answer
        });
        this.updateAnswer(this.data.currentQuestion - 1, answer);
    },

    // 更新当前题目的答案
    updateAnswer: function (index, answer) {
        const allAnswers = this.data.allAnswers;
        allAnswers[index] = answer;
        this.setData({
            allAnswers
        });
    },

    // 提交所有答案
    submitAllAnswers: function () {
        if (this.isAllAnswered()) {
            const {
                correctCount,
                records
            } = this.checkAllAnswers();
            wx.setStorageSync('answerRecords', records);
            this.setData({
                isAllSubmitted: true
            });

            // 构建要发送给后端的数据
            const dataToSend = [];
            for (let i = 0; i < this.data.totalQuestions; i++) {
                const question = this.data.questions[i];
                const answer = this.data.allAnswers[i];
                dataToSend.push({
                    questionId: question.questionId,
                    answer: answer
                });
            }

            // 使用封装的 apiJudgeTest 函数调用后端接口
            apiJudgeTest({ answers: dataToSend })
               .then(res => {
                    if (res.statusCode === 200) {
                        // 处理后端返回的结果
                        console.log('提交成功', res.data);
                        wx.showModal({
                            title: '答题结果',
                            content: `你答对了 ${correctCount} 道题，共 ${this.data.totalQuestions} 道题。`,
                            success: (resModal) => {
                                if (resModal.confirm) {
                                    wx.navigateBack();
                                }
                            }
                        });
                    } else {
                        console.error('提交失败，状态码:', res.statusCode, '响应数据:', res.data);
                        wx.showToast({
                            title: `提交答案失败，状态码: ${res.statusCode}`,
                            icon: 'none'
                        });
                    }
                })
               .catch(err => {
                    console.error('请求发生错误:', err);
                    wx.showToast({
                        title: '提交答案失败，请稍后重试',
                        icon: 'none'
                    });
                });
        } else {
            wx.showToast({
                title: '请回答所有问题',
                icon: 'none'
            });
        }
    },

    // 检查是否所有问题都已回答
    isAllAnswered: function () {
        return this.data.allAnswers.every(answer => answer || answer === false);
    },

    // 检查所有答案并返回正确数量和答题记录
    checkAllAnswers: function () {
        let correctCount = 0;
        const records = [];
        for (let i = 0; i < this.data.totalQuestions; i++) {
            const question = this.data.questions[i];
            const answer = this.data.allAnswers[i];
            const isCorrect = this.checkAnswer(question, answer);
            if (isCorrect) {
                correctCount++;
            }
            const record = {
                questionId: question.questionId,
                answer,
                isCorrect,
                usedTime: this.extractMinutes(this.data.remainingTime),
                timestamp: Date.now(),
                isSubmitted: true
            };
            if (question.type === '单选' || question.type === '多选') {
                record.options = question.options.map(option => ({
                    label: option.label,
                    selected: option.selected
                }));
            }
            records.push(record);
        }
        return {
            correctCount,
            records
        };
    },

    // 检查答案是否正确
    checkAnswer: function (question, answer) {
        if (question.type === '判断题') {
            return answer === question.answer;
        } else if (question.type === '多选题') {
            const sortedAnswer = answer.split('').sort().join('');
            const sortedCorrectAnswer = question.answer.split('').sort().join('');
            return sortedAnswer === sortedCorrectAnswer;
        } else if (question.type === '单选题') {
            return answer === question.answer;
        }
        return false;
    },

    // 提取时间字符串中的分钟部分
    extractMinutes: function (timeStr) {
        const parts = timeStr.split(':');
        return parts[0];
    },

    // 关闭解析弹窗并继续答题
    closeAnalysisAndContinue: function () {
        this.setData({
            showAnalysis: false
        });
        this.nextQuestion();
    },

    // 显示解析弹窗
    showAnalysis: function () {
        this.setData({
            showAnalysis: true
        });
    },

    // 关闭解析弹窗（仅关闭不跳转）
    closeAnalysis: function () {
        this.setData({
            showAnalysis: false
        });
    },

    // 触摸开始事件
    /* onTouchStart: function (e) {
        this.setData({
            touchStartX: e.touches[0].pageX
        });
    }, */

    // 触摸移动事件
    // onTouchMove: function (e) {
    //     this.setData({
    //         touchEndX: e.touches[0].pageX
    //     });
    // },

    // 触摸结束事件
    // onTouchEnd: function () {
    //     const { touchStartX, touchEndX, currentQuestion, totalQuestions } = this.data;
    //     const deltaX = touchEndX - touchStartX;
    //     if (deltaX > 50 && currentQuestion > 1) {
    //         // 向右滑动，显示上一题
    //         this.prevQuestion();
    //     } else if (deltaX < -50 && currentQuestion < totalQuestions) {
    //         // 向左滑动，显示下一题
    //         this.nextQuestion();
    //     }
    // }
});