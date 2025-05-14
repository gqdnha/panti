import {
    apiGetDailyTest
} from "../../../api/getDailyTest";
import {
    apiJudgeTest
} from "../../../api/judgeTest"
import {
    dailyQuestionCount
} from '../../../api/dailyQuestionCount'
import {
    addLearnTime
} from '../../../api/addLearnTime'

Page({
    data: {
        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        remainingTime: '20:00', //倒计时
        allAnswers: [], // 所有题目答案
        isSubmitted: false,
        isAllSubmitted: false,
        allQuestions: [], //所有题目
        selectedOptions: [], //记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {}, // 存储当前题目的详细数据，用于弹窗显示
        answerSheetStates: [],
        showAnswerSheetModal: false,
        questionStatuses: [],
        optionStates: [],
        startTime: 0,
        elapsedTime: 0, // 新增：记录已经过去的时间
        timer: null, // 新增：存储计时器
    },
    onLoad: function () {
        // 检查登录状态
        const token = wx.getStorageSync('token');
        if (!token) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            wx.navigateTo({
                url: '/pages/login/index'
            });
            return;
        }
        
        // 尝试从缓存加载数据
        this.loadCachedData();
        this.getData();
    },
    // 请求接口
    getData: function () {
        apiGetDailyTest().then(res => {
            console.log('获取到的原始数据：', res);

            res.forEach((question, index) => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options);
                        console.log(`题目${index + 1}的选项：`, question.options);
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = [];
                    }
                }
            });

            // 初始化选中选项数组和选项状态数组
            const initialSelectedOptions = new Array(res.length).fill(null).map(() => []);
            const initialOptionStates = res.map(question =>
                new Array(question.options.length).fill(false)
            );

            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                questionStates: new Array(res.length).fill(null),
                selectedOptions: initialSelectedOptions,
                optionStates: initialOptionStates,
                answerSheetStates: new Array(res.length).fill(false)
            }, () => {
                console.log('初始化完成：', {
                    totalQuestions: this.data.totalQuestions,
                    firstQuestionOptions: this.data.allQuestions[0].options,
                    selectedOptions: this.data.selectedOptions,
                    optionStates: this.data.optionStates
                });
            });
        });
    },
    nextQuestion: function () {
        const {
            currentQuestion,
            totalQuestions,
            selectedOptions
        } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
        }
    },
    prevQuestion: function () {
        const {
            currentQuestion,
            selectedOptions
        } = this.data;
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

        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        this.setData({
            answerSheetStates: answerSheetStates
        });

        // 保存缓存
        this.saveCachedData();
    },
    // 多选题
    selectMultipleOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions, optionStates } = this.data;

        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        currentOptionStates[index] = !currentOptionStates[index];

        let currentSelected = [];
        currentOptionStates.forEach((isSelected, idx) => {
            if (isSelected) {
                currentSelected.push(allQuestions[currentQuestion - 1].options[idx][0]);
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
        });

        // 保存缓存
        this.saveCachedData();
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

        // 更新答题卡状态为已作答
        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        this.setData({
            answerSheetStates: answerSheetStates
        });
    },
    // 开始倒计时
    startCountdown: function (initialElapsedTime = 0) {
        this.clearCountdown();
        const now = new Date();
        this.setData({
            startTime: now.getTime(),
            elapsedTime: initialElapsedTime
        });

        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const endOfDaySeconds = Math.floor((endOfDay - now) / 1000);
        let remainingSeconds = 1200 - initialElapsedTime; // 考虑已经过去的时间
        remainingSeconds = Math.min(remainingSeconds, endOfDaySeconds);

        this.data.timer = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                this.setData({
                    elapsedTime: this.data.elapsedTime + 1
                });
                const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
                const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
                this.setData({
                    remainingTime: `${minutes}:${seconds}`
                });
                // 保存缓存
                this.saveCachedData();
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
            this.data.timer = null;
        }
    },
    submitAllAnswers: function () {
        const {
            allQuestions,
            allAnswers,
            selectedOptions,
            questionStates,
            answerSheetStates,
            optionStates,
            startTime,
            elapsedTime
        } = this.data;
        const newQuestionStates = [...questionStates];
        const allUserAnswers = [];

        console.log('提交答案前的状态：', {
            allQuestions,
            selectedOptions,
            optionStates,
            answerSheetStates
        });

        // 检查是否所有题目都已作答
        const allAnswered = answerSheetStates.every(state => state === true);
        if (!allAnswered) {
            wx.showToast({
                title: '请作答所有题目',
                icon: 'none'
            });
            return;
        }

        allQuestions.forEach((question, index) => {
            if (!question) {
                console.error(`第${index + 1}题数据不存在`);
                return;
            }

            const questionId = question.id;
            const correctAnswer = question.correctAnswer;
            let isCorrect = false;
            let userAnswer = '';

            if (!correctAnswer) {
                console.error(`第${index + 1}题缺少正确答案`);
                return;
            }

            if (question.type === '单选题' || question.type === '判断题') {
                userAnswer = selectedOptions[index] || '';
                isCorrect = userAnswer === (correctAnswer[0] || '');
            } else if (question.type === '多选题') {
                const selectedChars = selectedOptions[index] || [];
                userAnswer = selectedChars.sort().join('');
                const correctAnswerString = (correctAnswer || '').split('').sort().join('');
                isCorrect = userAnswer === correctAnswerString;
            } else if (question.type === '填空题') {
                userAnswer = allAnswers[index] || '';
                isCorrect = userAnswer === correctAnswer;
            }

            allUserAnswers.push({
                'questionId': questionId,
                'answer': userAnswer
            });
            newQuestionStates[index] = isCorrect;
        });

        console.log('提交的答案：', allUserAnswers);

        this.setData({
            isAllSubmitted: true,
            questionStates: newQuestionStates,
            isSubmitted: true
        });

        // 计算使用的时间（包括缓存的时间）
        const endTime = new Date().getTime();
        const usedTime = endTime - startTime + (elapsedTime * 1000);
        const minutes = Math.floor(usedTime / (1000 * 60));
        
        // 保存最终状态到缓存
        const finalCacheData = {
            currentQuestion: this.data.currentQuestion,
            selectedOptions: this.data.selectedOptions,
            optionStates: this.data.optionStates,
            answerSheetStates: this.data.answerSheetStates,
            elapsedTime: this.data.elapsedTime,
            isAllSubmitted: true,
            questionStates: newQuestionStates,
            isSubmitted: true
        };
        wx.setStorageSync('dailyPracticeCache', finalCacheData);

        addLearnTime(minutes).then(res => {
            console.log('传时间', minutes);
        });

        // 调用后端接口
        apiJudgeTest(allUserAnswers).then(response => {
            console.log('后端返回结果：', response);
        }).catch(error => {
            console.error('提交答案到后端时出错：', error);
        });

        const totalCount = this.data.totalQuestions;
        console.log(totalCount);
        dailyQuestionCount(totalCount).then(res => {
            console.log(res,'请求成功');
        });
    },
    onTouchStart: function (e) {
        // 在这里添加触摸开始事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    onTouchEnd: function (e) {
        // 在这里添加触摸结束事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    showAnalysis: function () {
        const {
            currentQuestion,
            allQuestions
        } = this.data;
        const currentQuestionData = allQuestions[currentQuestion - 1];
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
    // 自定义函数，用于判断数组是否包含某个元素
    isArrayAndIncludes: function (arr, item) {
        if (!arr) return false;
        if (!Array.isArray(arr)) return false;
        return arr.includes(item);
    },
    // 新增：点击答题卡的事件处理函数
    showAnswerSheet: function () {
        const {
            answerSheetStates
        } = this.data;
        const questionStatuses = answerSheetStates.map((state, index) => ({
            index: index + 1,
            isAnswered: state,
            highlightClass: state ? 'answered-highlight' : 'unanswered-dark'
        }));
        this.setData({
            showAnswerSheetModal: true,
            questionStatuses: questionStatuses
        });
    },
    // 新增：关闭答题卡弹窗的函数
    closeAnswerSheetModal: function () {
        this.setData({
            showAnswerSheetModal: false
        });
    },
    // 新增：点击答题卡上的题目跳转到对应题目的函数
    jumpToQuestion: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        this.setData({
            currentQuestion: index
        });
        this.closeAnswerSheetModal();
    },
    // 新增：加载缓存数据
    loadCachedData() {
        const cachedData = wx.getStorageSync('dailyPracticeCache');
        if (cachedData) {
            const {
                currentQuestion,
                selectedOptions,
                optionStates,
                answerSheetStates,
                elapsedTime,
                isAllSubmitted,
                questionStates,
                isSubmitted
            } = cachedData;

            this.setData({
                currentQuestion,
                selectedOptions,
                optionStates,
                answerSheetStates,
                elapsedTime,
                isAllSubmitted,
                questionStates,
                isSubmitted
            });

            // 如果已经提交过答案，不再启动计时器
            if (!isAllSubmitted) {
                this.startCountdown(elapsedTime);
            }
        } else {
            this.startCountdown();
        }
    },
    // 新增：保存缓存数据
    saveCachedData() {
        const cacheData = {
            currentQuestion: this.data.currentQuestion,
            selectedOptions: this.data.selectedOptions,
            optionStates: this.data.optionStates,
            answerSheetStates: this.data.answerSheetStates,
            elapsedTime: this.data.elapsedTime
        };
        wx.setStorageSync('dailyPracticeCache', cacheData);
    },
    // 新增：页面隐藏时保存缓存
    onHide: function() {
        this.saveCachedData();
    },
    // 新增：页面卸载时清除缓存
    onUnload: function() {
        // 清除缓存
        wx.removeStorageSync('dailyPracticeCache');
        
        // 清除计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.data.timer = null;
        }

        // 重新获取数据
        this.getData();
    }
})    