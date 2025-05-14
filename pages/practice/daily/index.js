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
        // 新增：答题卡状态，记录每个题目是否已作答
        answerSheetStates: [],
        showAnswerSheetModal: false, // 控制答题卡弹窗的显示状态
        questionStatuses: [], // 存储题目作答情况数据
        optionStates: [], // 存储每个题目的选项状态
        startTime: 0, // 新增：记录开始时间
        questionAnalysis: {}, // 存储每个题目的解析信息
        // 新增：存储每个题目的正确答案（改为对象，使用questionId作为键）
        correctAnswers: {},
        hasShownExitWarning: false, // 是否已显示过退出警告
        cachedAnswers: [], // 缓存的用户答案
    },
    onLoad: function () {
        this.startCountdown()
        this.getData()
        // 加载缓存的答案
        this.loadCachedAnswers()
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

            // 检查是否有缓存数据
            const cachedData = wx.getStorageSync('dailyTestAnswers');
            
            if (cachedData && cachedData.totalQuestions === res.length) {
                // 有缓存且题目数量匹配，使用缓存数据
                this.setData({
                    allQuestions: res,
                    totalQuestions: res.length,
                    questionStates: new Array(res.length).fill(null),
                    // 使用缓存的状态
                    selectedOptions: cachedData.selectedOptions || new Array(res.length).fill(null).map(() => []),
                    optionStates: cachedData.optionStates || res.map(question => new Array(question.options.length).fill(false)),
                    answerSheetStates: cachedData.answerSheetStates || new Array(res.length).fill(false),
                    allAnswers: cachedData.allAnswers || [],
                    currentQuestion: cachedData.currentQuestion || 1,
                    startTime: cachedData.startTime || 0
                }, () => {
                    console.log('恢复缓存状态完成');
                });
            } else {
                // 没有缓存或题目数量不匹配，使用初始状态
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
            }
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
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            allQuestions
        } = this.data;
        const newSelectedOptions = [...selectedOptions];
        const optionFirstChar = allQuestions[currentQuestion - 1].options[index][0];
        newSelectedOptions[currentQuestion - 1] = optionFirstChar;
        
        // 更新答题卡状态为已作答
        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        
        this.setData({
            selectedOptions: newSelectedOptions,
            answerSheetStates: answerSheetStates
        }, () => {
            // 更新缓存
            this.cacheCurrentAnswers();
        });
        
        console.log(`第 ${currentQuestion} 题选中的选项首字：`, optionFirstChar);
    },
    // 多选题
    selectMultipleOption: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            allQuestions,
            optionStates
        } = this.data;

        console.log('选择选项前的状态：', {
            currentQuestion,
            index,
            selectedOptions: selectedOptions[currentQuestion - 1],
            optionStates: optionStates[currentQuestion - 1]
        });

        // 获取当前题目的选项状态
        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        // 切换当前选项的状态
        currentOptionStates[index] = !currentOptionStates[index];

        // 更新选中选项
        let currentSelected = [];
        currentOptionStates.forEach((isSelected, idx) => {
            if (isSelected) {
                currentSelected.push(allQuestions[currentQuestion - 1].options[idx][0]);
            }
        });

        // 对选项进行排序
        currentSelected.sort();

        // 更新数据
        const newSelectedOptions = [...selectedOptions];
        newSelectedOptions[currentQuestion - 1] = currentSelected;

        const newOptionStates = [...optionStates];
        newOptionStates[currentQuestion - 1] = currentOptionStates;

        this.setData({
            selectedOptions: newSelectedOptions,
            optionStates: newOptionStates,
            [`answerSheetStates[${currentQuestion - 1}]`]: true
        }, () => {
            // 更新缓存
            this.cacheCurrentAnswers();
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
        
        // 更新答题卡状态为已作答
        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        
        this.setData({
            allAnswers: newAllAnswers,
            answerSheetStates: answerSheetStates
        }, () => {
            // 更新缓存
            this.cacheCurrentAnswers();
        });
    },
    // 开始倒计时
    startCountdown: function () {
        this.clearCountdown();
        // 获取当前时间
        const now = new Date();
        // 记录开始时间
        this.setData({
            startTime: now.getTime()
        });
        // 计算距离当天24:00的剩余时间（单位：秒）
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const endOfDaySeconds = Math.floor((endOfDay - now) / 1000);

        let remainingSeconds = 1200; // 初始倒计时时间
        // 取较小值作为实际倒计时时间
        remainingSeconds = Math.min(remainingSeconds, endOfDaySeconds);

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
    submitAllAnswers: function () {
        const {
            allQuestions,
            allAnswers,
            selectedOptions,
            questionStates,
            answerSheetStates,
            optionStates,
            startTime
        } = this.data;
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
            const userAnswer = allAnswers[index];
            const questionId = question.questionId;

            if (question.type === '单选题' || question.type === '判断题') {
                const selectedChar = selectedOptions[index];
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': selectedChar || ''
                });
            } else if (question.type === '多选题') {
                const selectedIndexes = optionStates[index] || [];
                const selectedChars = [];

                selectedIndexes.forEach((isSelected, idx) => {
                    if (isSelected && question.options && question.options[idx]) {
                        selectedChars.push(question.options[idx][0]);
                    }
                });

                const selectedAnswer = selectedChars.sort().join('');
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': selectedAnswer
                });
            } else if (question.type === '填空题') {
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': userAnswer
                });
            }
        });

        console.log('提交的答案：', allUserAnswers);

        // 计算使用的时间
        const endTime = new Date().getTime();
        const usedTime = endTime - startTime;
        const minutes = Math.floor(usedTime / (1000 * 60));
        addLearnTime(minutes).then(res => {
            console.log('传时间', minutes);
        })

        // 调用后端接口
        apiJudgeTest(allUserAnswers).then(response => {
            console.log('后端返回结果：', response);

            // 根据后端返回结果设置题目状态和解析
            const newQuestionStates = [];
            const newQuestionAnalysis = {};
            const newCorrectAnswers = {};
            
            // 创建questionId到索引的映射
            const questionIdToIndex = {};
            this.data.allQuestions.forEach((question, index) => {
                questionIdToIndex[question.questionId] = index;
            });

            response.forEach((result) => {
                const index = questionIdToIndex[result.questionId];
                if (index !== undefined) {
                    newQuestionStates[index] = result.rightOrWrong === '对';
                    newQuestionAnalysis[result.questionId] = result.analysis || '';
                    newCorrectAnswers[result.questionId] = result.answer;
                }
            });

            this.setData({
                isAllSubmitted: true,
                questionStates: newQuestionStates,
                isSubmitted: true,
                questionAnalysis: newQuestionAnalysis,
                correctAnswers: newCorrectAnswers
            }, () => {
                // 提交成功后清除缓存
                this.clearCachedAnswers();
            });
        })
        .catch(error => {
            console.error('提交答案到后端时出错：', error);
            // 如果后端出错，可以使用本地判断作为备选方案
            const newQuestionStates = [...questionStates];
            allQuestions.forEach((question, index) => {
                // 本地判断逻辑...
            });
            this.setData({
                isAllSubmitted: true,
                questionStates: newQuestionStates,
                isSubmitted: true
            }, () => {
                // 清除缓存
                this.clearCachedAnswers();
            });
        });

        const totalCount = this.data.totalQuestions;
        dailyQuestionCount(totalCount).then(res => {
            console.log(res, '请求成功');
        })
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
            allQuestions,
            questionAnalysis,
            correctAnswers
        } = this.data;
        const currentQuestionData = allQuestions[currentQuestion - 1];
        const analysis = questionAnalysis[currentQuestionData.questionId];
        const correctAnswer = correctAnswers[currentQuestionData.questionId]; // 使用questionId获取答案

        this.setData({
            showAnalysis: true,
            currentQuestionData: {
                ...currentQuestionData,
                analysis: analysis,
                correctAnswer: correctAnswer
            }
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
            highlightClass: state? 'answered-highlight' : 'unanswered-dark'
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
    // 加载缓存的答案
    loadCachedAnswers: function() {
        try {
            const cachedData = wx.getStorageSync('dailyTestAnswers');
            if (cachedData) {
                console.log('发现缓存的答题数据：', cachedData);
                this.setData({
                    cachedAnswers: cachedData.cachedAnswers || [],
                    currentQuestion: cachedData.currentQuestion || 1,
                    selectedOptions: cachedData.selectedOptions || [],
                    optionStates: cachedData.optionStates || [],
                    answerSheetStates: cachedData.answerSheetStates || [],
                    allAnswers: cachedData.allAnswers || [],
                    startTime: cachedData.startTime || 0
                });
                
                // 恢复倒计时
                if (cachedData.startTime) {
                    this.restoreCachedCountdown(cachedData.startTime);
                }
                
                wx.showToast({
                    title: '已恢复上次答题进度',
                    icon: 'success',
                    duration: 2000
                });
            }
        } catch (error) {
            console.log('加载缓存答案失败：', error);
        }
    },
    // 恢复缓存的倒计时
    restoreCachedCountdown: function(originalStartTime) {
        const currentTime = new Date().getTime();
        const usedTime = currentTime - originalStartTime;
        const totalTime = 1200 * 1000; // 20分钟
        const remainingTime = Math.max(0, totalTime - usedTime);
        const remainingSeconds = Math.floor(remainingTime / 1000);
        
        if (remainingSeconds > 0) {
            this.startCountdownWithTime(remainingSeconds);
        } else {
            // 时间已到，直接提交
            this.submitAllAnswers();
        }
    },
    // 使用指定时间开始倒计时
    startCountdownWithTime: function(seconds) {
        this.clearCountdown();
        let remainingSeconds = seconds;
        
        this.data.timer = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
                const secs = (remainingSeconds % 60).toString().padStart(2, '0');
                this.setData({
                    remainingTime: `${minutes}:${secs}`
                });
            } else {
                this.clearCountdown();
                this.submitAllAnswers();
            }
        }, 1000);
    },
    // 缓存当前答题状态
    cacheCurrentAnswers: function() {
        try {
            const cacheData = {
                cachedAnswers: this.data.cachedAnswers,
                currentQuestion: this.data.currentQuestion,
                selectedOptions: this.data.selectedOptions,
                optionStates: this.data.optionStates,
                answerSheetStates: this.data.answerSheetStates,
                allAnswers: this.data.allAnswers,
                startTime: this.data.startTime,
                totalQuestions: this.data.totalQuestions,
                timestamp: new Date().getTime()
            };
            wx.setStorageSync('dailyTestAnswers', cacheData);
            console.log('答题状态已缓存');
        } catch (error) {
            console.log('缓存答题状态失败：', error);
        }
    },
    // 清除缓存的答案
    clearCachedAnswers: function() {
        try {
            wx.removeStorageSync('dailyTestAnswers');
            console.log('缓存已清除');
        } catch (error) {
            console.log('清除缓存失败：', error);
        }
    },
    // 页面隐藏时触发（用户点击返回按钮时）
    onHide: function() {
        // 只在答题未完成且未显示过警告时处理
        if (!this.data.isAllSubmitted && !this.data.hasShownExitWarning) {
            // 缓存当前答题状态
            this.cacheCurrentAnswers();
            
            // 清除倒计时避免在后台继续运行
            this.clearCountdown();
            
            // 标记已显示过警告，避免重复弹窗
            this.setData({
                hasShownExitWarning: true
            });
        }
    },
    // 页面显示时触发
    onShow: function() {
        // 如果用户返回到答题页面且答题未完成
        if (!this.data.isAllSubmitted && this.data.hasShownExitWarning) {
            // 重置警告标记
            this.setData({
                hasShownExitWarning: false
            });
            
            // 显示确认弹窗
            wx.showModal({
                title: '提示',
                content: '检测到您刚才退出了答题页面，是否要继续答题？点击"确定"继续答题，点击"取消"将提交已答题目。',
                confirmText: '继续答题',
                cancelText: '提交退出',
                success: (res) => {
                    if (res.confirm) {
                        // 用户选择继续答题，重新开始倒计时
                        this.restartCountdown();
                    } else {
                        // 用户选择退出，提交已答题目
                        this.submitAllAnswersAndExit();
                    }
                }
            });
        } else if (!this.data.isAllSubmitted && this.data.startTime > 0) {
            // 正常情况下重新开始倒计时
            this.restartCountdown();
        }
    },
    // 重新开始倒计时
    restartCountdown: function() {
        // 计算剩余时间
        const currentTime = new Date().getTime();
        const usedTime = currentTime - this.data.startTime;
        const totalTime = 1200 * 1000; // 20分钟
        const remainingTime = Math.max(0, totalTime - usedTime);
        const remainingSeconds = Math.floor(remainingTime / 1000);
        
        if (remainingSeconds > 0) {
            this.startCountdownWithTime(remainingSeconds);
        } else {
            // 时间已到，直接提交
            this.submitAllAnswers();
        }
    },
    // 提交答案并退出
    submitAllAnswersAndExit: function() {
        // 如果用户已经完成所有题目，正常提交
        if (this.data.answerSheetStates.every(state => state === true)) {
            this.submitAllAnswers();
        } else {
            // 如果未完成所有题目，提交已答题目
            this.submitPartialAnswers();
        }
        
        // 退出页面
        setTimeout(() => {
            // 清除缓存
            this.clearCachedAnswers();
            wx.navigateBack();
        }, 500);
    },
    // 提交部分答案
    submitPartialAnswers: function() {
        const {
            allQuestions,
            allAnswers,
            selectedOptions,
            optionStates,
            startTime
        } = this.data;
        const allUserAnswers = [];

        allQuestions.forEach((question, index) => {
            const userAnswer = allAnswers[index];
            const questionId = question.questionId;

            if (question.type === '单选题' || question.type === '判断题') {
                const selectedChar = selectedOptions[index];
                if (selectedChar) {
                    allUserAnswers.push({
                        'questionId': questionId,
                        'answer': selectedChar
                    });
                }
            } else if (question.type === '多选题') {
                const selectedIndexes = optionStates[index] || [];
                const selectedChars = [];

                selectedIndexes.forEach((isSelected, idx) => {
                    if (isSelected && question.options && question.options[idx]) {
                        selectedChars.push(question.options[idx][0]);
                    }
                });

                if (selectedChars.length > 0) {
                    const selectedAnswer = selectedChars.sort().join('');
                    allUserAnswers.push({
                        'questionId': questionId,
                        'answer': selectedAnswer
                    });
                }
            } else if (question.type === '填空题' && userAnswer) {
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': userAnswer
                });
            }
        });

        // 计算使用的时间
        const endTime = new Date().getTime();
        const usedTime = endTime - startTime;
        const minutes = Math.floor(usedTime / (1000 * 60));
        addLearnTime(minutes);

        if (allUserAnswers.length > 0) {
            apiJudgeTest(allUserAnswers).then(response => {
                console.log('部分答案提交成功', response);
            }).catch(error => {
                console.error('部分答案提交失败', error);
            });
        }
        
        this.setData({
            isAllSubmitted: true,
            isSubmitted: true
        });
    },
    // 页面卸载时的处理
    onUnload: function() {
        // 清除倒计时
        this.clearCountdown();
        // 如果答题未完成，缓存当前状态
        if (!this.data.isAllSubmitted) {
            this.cacheCurrentAnswers();
        }
    }
})