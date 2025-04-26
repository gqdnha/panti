const {
    questions
} = require('../../../data/questions.js');

Page({
    data: {
        currentQuestion: 1,
        totalQuestions: questions.length,
        remainingTime: '20:00', // 初始化为 20 分钟
        startTime: 0,
        currentQuestionData: null,
        answer: '',
        showAnalysis: false,
        isCorrect: false,
        timer: null,
        questions: questions,
        touchStartX: 0, // 触摸开始时的 X 坐标
        touchEndX: 0,    // 触摸结束时的 X 坐标
        isSubmitted: false, // 添加标志位，记录是否已经提交过答案
        isAllSubmitted: false, // 记录是否所有答案都已提交
        allAnswers: [] // 存储所有题目的答案
    },

    onLoad: function () {
        this.startCountdown();
        this.loadQuestion(this.data.currentQuestion);
        // 初始化所有题目的答案
        this.data.allAnswers = new Array(this.data.totalQuestions).fill('');
    },

    onUnload: function () {
        this.clearCountdown();
    },

    // 开始倒计时
    startCountdown: function () {
        this.clearCountdown();
        let remainingSeconds = 1200; // 20 分钟 = 1200 秒
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

    // 加载题目
    loadQuestion: function (questionIndex) {
        const question = this.data.questions[questionIndex - 1];
        if (question) {
            // 从缓存中读取答案和选项状态
            const records = wx.getStorageSync('answerRecords') || [];
            const record = records.find(r => r.questionId === question.id);
            if (record) {
                this.setData({
                    answer: record.answer,
                    isCorrect: record.isCorrect,
                    isSubmitted: record.isSubmitted
                });
                if (question.type === '单选' || question.type === '多选') {
                    question.options = question.options.map(option => {
                        const selected = record.options && record.options.some(o => o.label === option.label && o.selected);
                        return {
                            ...option,
                            selected: selected
                        };
                    });
                } else if (question.type === '判断') {
                    this.setData({
                        answer: record.answer === 'true'
                    });
                }
            } else {
                this.setData({
                    answer: '',
                    isCorrect: false,
                    isSubmitted: false
                });
                if (question.options) {
                    question.options = question.options.map(option => ({
                        ...option,
                        selected: false
                    }));
                }
            }

            this.setData({
                currentQuestionData: question
            });
            // 加载当前题目的答案
            this.setData({
                answer: this.data.allAnswers[questionIndex - 1]
            });
        }
    },

    // 选择单选题选项
    selectOption: function (e) {
        const index = e.currentTarget.dataset.index;
        const options = this.data.currentQuestionData.options.map((item, i) => {
            return {
                ...item,
                selected: i === index
            };
        });

        const answer = options[index].label;
        this.setData({
            'currentQuestionData.options': options,
            answer
        });
        // 保存当前题目的答案
        this.data.allAnswers[this.data.currentQuestion - 1] = answer;
    },

    // 选择多选题选项
    selectMultipleOption: function (e) {
        const index = e.currentTarget.dataset.index;
        const options = this.data.currentQuestionData.options.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    selected:!item.selected
                };
            }
            return item;
        });

        const selectedOptions = options
           .filter(item => item.selected)
           .map(item => item.label)
           .join('');

        this.setData({
            'currentQuestionData.options': options,
            answer: selectedOptions
        });
        // 保存当前题目的答案
        this.data.allAnswers[this.data.currentQuestion - 1] = selectedOptions;
    },

    // 选择判断题答案
    selectJudge: function (e) {
        const value = e.currentTarget.dataset.value;
        this.setData({
            answer: value
        });
        // 保存当前题目的答案
        this.data.allAnswers[this.data.currentQuestion - 1] = value;
    },

    // 填空题输入答案
    onInputAnswer: function (e) {
        const answer = e.detail.value;
        this.setData({
            answer
        });
        // 保存当前题目的答案
        this.data.allAnswers[this.data.currentQuestion - 1] = answer;
    },

    // 提交所有答案
    submitAllAnswers: function () {
        let allAnswered = true;
        let correctCount = 0;
        const records = [];

        for (let i = 0; i < this.data.totalQuestions; i++) {
            const question = this.data.questions[i];
            const answer = this.data.allAnswers[i];

            if (!answer && answer!== false) {
                allAnswered = false;
                break;
            }

            // 检查答案是否正确
            const isCorrect = this.checkAnswer(question, answer);
            if (isCorrect) {
                correctCount++;
            }

            // 保存答题记录
            const record = {
                questionId: question.id,
                answer,
                isCorrect,
                usedTime: this.extractMinutes(this.data.remainingTime), // 保存剩余时间
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

        if (!allAnswered) {
            wx.showToast({
                title: '请回答所有问题',
                icon: 'none'
            });
            return;
        }

        // 保存所有答题记录
        wx.setStorageSync('answerRecords', records);

        this.setData({
            isAllSubmitted: true
        });

        // 显示结果
        wx.showModal({
            title: '答题结果',
            content: `你答对了 ${correctCount} 道题，共 ${this.data.totalQuestions} 道题。`,
            success: (res) => {
                if (res.confirm) {
                    wx.navigateBack();
                }
            }
        });
    },

    // 检查答案是否正确
    checkAnswer: function (question, answer) {
        if (question.type === '判断') {
            return answer === question.correctAnswer;
        } else if (question.type === '多选') {
            // 对多选题答案进行排序后比较
            const sortedAnswer = answer.split('').sort().join('');
            const sortedCorrectAnswer = question.correctAnswer.split('').sort().join('');
            return sortedAnswer === sortedCorrectAnswer;
        } else {
            return answer === question.correctAnswer;
        }
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

    // 上一题
    prevQuestion: function () {
        if (this.data.currentQuestion > 1) {
            this.setData({
                currentQuestion: this.data.currentQuestion - 1,
                showAnalysis: false
            }, () => {
                this.loadQuestion(this.data.currentQuestion);
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

    // 触摸开始事件
    onTouchStart: function (e) {
        this.setData({
            touchStartX: e.touches[0].pageX
        });
    },

    // 触摸移动事件
    /* onTouchMove: function (e) {
        this.setData({
            touchEndX: e.touches[0].pageX
        });
    }, */

    // 触摸结束事件
    /* onTouchEnd: function () {
        const { touchStartX, touchEndX, currentQuestion, totalQuestions } = this.data;
        const deltaX = touchEndX - touchStartX;

        if (deltaX > 50 && currentQuestion > 1) {
            // 向右滑动，显示上一题
            this.prevQuestion();
        } else if (deltaX < -50 && currentQuestion < totalQuestions) {
            // 向左滑动，显示下一题
            this.nextQuestion();
        }
    } */
});    