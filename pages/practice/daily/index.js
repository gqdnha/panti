import {
    apiGetDailyTest
} from "../../../api/getDailyTest";
import {
    apiJudgeTest
} from "../../../api/judgeTest"
// import {requst} from "../../../api/request"

Page({
    data: {
        allQuestions: null,
        answer: '',
        showAnalysis: false,
        isCorrect: false,
        timer: null,
        touchStartX: 0,
        touchEndX: 0,
        isAllSubmitted: false,


        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        remainingTime: '20:00', //倒计时
        allAnswers: [], // 所有题目答案
        isSubmitted: false,
        isAllSubmitted: false,
        allQuestions: [] //所有题目
    },

    onLoad: function () {
        this.startCountdown();
        this.getData();
    },

    onUnload: function () {
        this.clearCountdown();
    },

    // 获取题目数据
    /* fetchQuestions: function () {
        apiGetDailyTest().then(res => {
            console.log(res, '111');
            // console.log(res.data); //undefined
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
                console.log(newQuestions.options);
                this.setData({
                    questions: newQuestions,
                    totalQuestions: newQuestions.length,
                    allQuestions: newQuestions[0],
                    allAnswers: new Array(newQuestions.length).fill(''),
                    // content: newQuestions.options
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
    }, */
    getData: function () {
        apiGetDailyTest().then(res => {
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
                totalQuestions: res.length
            })
            console.log(this.data.allQuestions);
            console.log(this.data.totalQuestions);
            console.log(this.data.allQuestions[1].options);
        })
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
    // 下一题
    nextQuestion: function () {
        const {
            currentQuestion,
            totalQuestions
        } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
        }
    },
    // 上一题
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
        // 如果 recordOptions 为 undefined，将所有选项的 selected 属性设置为 false
        return options.map(option => ({
            ...option,
            selected: false
        }));
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
        return options;
    },

    // 选择单选题选项
    selectOption: function (e) {
        const index = e.currentTarget.dataset.index;
        const options = this.setSelectedOption(this.data.allQuestions.options, index);
        console.log(options);
        const answer = options[index].label;
        this.setData({
            'allQuestions.options': options,
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
        const options = this.toggleSelectedOption(this.data.allQuestions.options, index);
        const selectedOptions = options
            .filter(item => item.selected)
            .map(item => item.label)
            .join('');
        this.setData({
            'allQuestions.options': options,
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
    // index.js 部分代码
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
            apiJudgeTest({
                    answers: dataToSend
                })
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
    /* checkAnswer: function (question, answer) {
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
    }, */

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