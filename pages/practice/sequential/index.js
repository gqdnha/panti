const {
    questions
} = require('../../../data/questions.js');

Page({
    data: {
        currentQuestion: 1,
        totalQuestions: questions.length,
        usedTime: '00:00', // 初始化为 00:00 格式
        startTime: 0,
        currentQuestionData: null,
        answer: '',
        showAnalysis: false,
        isCorrect: false,
        timer: null,
        questions: questions,
        touchStartX: 0, // 触摸开始时的 X 坐标
        touchEndX: 0,    // 触摸结束时的 X 坐标
        isSubmitted: false // 添加标志位，记录是否已经提交过答案
    },

    onLoad: function () {
        this.setData({
            startTime: Date.now()
        });
        this.startTimer();
        this.loadQuestion(this.data.currentQuestion);
    },

    onUnload: function () {
        this.clearTimer();
    },

    // 开始计时器
    startTimer: function () {
        this.clearTimer();
        this.data.timer = setInterval(() => {
            const now = Date.now();
            const elapsedTime = now - this.data.startTime;
            const minutes = Math.floor(elapsedTime / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((elapsedTime % 60000) / 1000).toString().padStart(2, '0');
            this.setData({
                usedTime: `${minutes}:${seconds}`
            });
        }, 1000);
    },

    // 清除计时器
    clearTimer: function () {
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

        this.setData({
            'currentQuestionData.options': options,
            answer: options[index].label
        });
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
    },

    // 选择判断题答案
    selectJudge: function (e) {
        const value = e.currentTarget.dataset.value;
        this.setData({
            answer: value
        });
    },

    // 填空题输入答案
    onInputAnswer: function (e) {
        this.setData({
            answer: e.detail.value
        });
    },

    // 提交答案
    submitAnswer: function () {
        if (!this.data.answer && this.data.answer!== false) {
            wx.showToast({
                title: '请选择或输入答案',
                icon: 'none'
            });
            return;
        }

        if (this.data.isSubmitted) {
            return; // 如果已经提交过答案，直接返回
        }

        // 检查答案是否正确
        const isCorrect = this.checkAnswer();

        // 保存答题记录
        this.saveAnswerRecord(isCorrect);

        this.setData({
            showAnalysis: true,
            isCorrect,
            isSubmitted: true // 设置已经提交过答案的标志
        });
    },

    // 检查答案是否正确
    checkAnswer: function () {
        const {
            currentQuestionData,
            answer
        } = this.data;

        if (currentQuestionData.type === '判断') {
            return answer === currentQuestionData.correctAnswer;
        } else if (currentQuestionData.type === '多选') {
            // 对多选题答案进行排序后比较
            const sortedAnswer = answer.split('').sort().join('');
            const sortedCorrectAnswer = currentQuestionData.correctAnswer.split('').sort().join('');
            return sortedAnswer === sortedCorrectAnswer;
        } else {
            return answer === currentQuestionData.correctAnswer;
        }
    },

    // 保存答题记录
    saveAnswerRecord: function (isCorrect) {
        const record = {
            questionId: this.data.currentQuestionData.id,
            answer: this.data.answer,
            isCorrect,
            usedTime: this.extractMinutes(this.data.usedTime), // 只保存分钟部分
            timestamp: Date.now(),
            isSubmitted: true
        };

        if (this.data.currentQuestionData.type === '单选' || this.data.currentQuestionData.type === '多选') {
            record.options = this.data.currentQuestionData.options.map(option => ({
                label: option.label,
                selected: option.selected
            }));
        }

        // 保存到本地存储
        const records = wx.getStorageSync('answerRecords') || [];
        const existingRecordIndex = records.findIndex(r => r.questionId === record.questionId);
        if (existingRecordIndex > -1) {
            records[existingRecordIndex] = record;
        } else {
            records.push(record);
        }
        wx.setStorageSync('answerRecords', records);

        // 如果答错了，加入错题本
        /* if (!isCorrect) {
            const wrongQuestions = wx.getStorageSync('wrongQuestions') || [];
            wrongQuestions.push(this.data.currentQuestionData);
            wx.setStorageSync('wrongQuestions', wrongQuestions);
        } */
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
        } else {
            wx.showModal({
                title: '提示',
                content: '已经是最后一题了，是否返回首页？',
                success: (res) => {
                    if (res.confirm) {
                        wx.navigateBack();
                    }
                }
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
    onTouchMove: function (e) {
        this.setData({
            touchEndX: e.touches[0].pageX
        });
    },

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