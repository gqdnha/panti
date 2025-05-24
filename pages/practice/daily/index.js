import {
    apiGetDailyTest
} from "../../../api/getDailyTest";
import {
    apiDailyJudgeTest
} from "../../../api/judgeTest"
import {
    dailyQuestionCount
} from '../../../api/dailyQuestionCount'
import {
    addLearnTime
} from '../../../api/addLearnTime'
import {getDailyTestAnswer} from '../../../api/getDailyTestAnswer'
import {
    getDailyFinesh
} from '../../../api/getDeilyFinash'
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
        cachedAnswers: [], // 缓存的用户答案
        baseImageUrl: 'https://gqdnha.cn:8090/static/', // 添加图片基础URL
        showImagePreview: false, // 控制图片预览弹窗
        currentPreviewImage: '', // 当前预览的图片URL
        scale: 1,
        baseScale: 1,
        transition: '',
        startDistance: 0,
        ifFinash:0
    },
    onLoad: function () {
        // 先检查今天是否已经提交过答案
        this.checkTodaySubmission();
        // 获取题目数据
        this.getData();
        // 检查缓存并启动倒计时
        this.checkCacheAndStartTimer();
    },
    // 用户是否完成
    userFinash() {
        getDailyFinesh().then(res => {
            console.log('获取完成状态：', res);
            this.setData({
                ifFinash: res
            }, () => {
                // 如果已完成，检查并恢复答题数据
                if (res === 100) {
                    this.checkTodaySubmission();
                }
            });
        }).catch(error => {
            console.error('获取完成状态失败：', error);
        });
    },
    // 检查缓存并启动相应的倒计时
    checkCacheAndStartTimer: function() {
        try {
            const cachedData = wx.getStorageSync('dailyTestAnswers');
            if (cachedData && cachedData.startTime) {
                // 有缓存数据，恢复倒计时
                console.log('发现缓存数据，恢复倒计时');
                this.setData({
                    startTime: cachedData.startTime
                });
                this.restoreCachedCountdown(cachedData.startTime);
            } else {
                // 没有缓存，开始新的倒计时
                console.log('没有缓存数据，开始新倒计时');
                this.startCountdown();
            }
        } catch (error) {
            console.log('检查缓存失败，开始新倒计时：', error);
            this.startCountdown();
        }
    },
    // 请求接口
    getData: function () {
        apiGetDailyTest().then(res => {
            console.log('获取到的原始数据：', res);

            // 处理每个题目的数据
            res.forEach((question, index) => {
                // 处理选项
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options);
                        console.log(`题目${index + 1}的选项：`, question.options);
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = [];
                    }
                }

                // 处理图片数据
                if (question.ifPicture && question.questionsImageList) {
                    try {
                        // 如果questionsImageList是字符串，尝试解析它
                        if (typeof question.questionsImageList === 'string') {
                            question.questionsImageList = JSON.parse(question.questionsImageList);
                        }
                        // 确保每个图片URL都是完整的
                        question.questionsImageList = question.questionsImageList.map(img => ({
                            ...img,
                            fullImageUrl: this.data.baseImageUrl + img.imageUrl
                        }));
                        console.log(`题目${index + 1}的图片列表：`, question.questionsImageList);
                    } catch (error) {
                        console.log('图片列表解析错误：', error);
                        question.questionsImageList = [];
                    }
                } else {
                    question.questionsImageList = [];
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
                    optionStates: cachedData.optionStates || res.map(question => new Array(question.options ? question.options.length : 0).fill(false)),
                    answerSheetStates: cachedData.answerSheetStates || new Array(res.length).fill(false),
                    allAnswers: cachedData.allAnswers || new Array(res.length).fill(''), // 确保填空题答案被正确恢复
                    currentQuestion: cachedData.currentQuestion || 1,
                    // 重置提交状态
                    isSubmitted: false,
                    isAllSubmitted: false,
                    questionAnalysis: {},
                    correctAnswers: {}
                }, () => {
                    console.log('恢复缓存状态完成');
                    // 显示恢复提示
                    wx.showToast({
                        title: '已恢复上次答题进度',
                        icon: 'success',
                        duration: 2000
                    });
                });
            } else {
                // 没有缓存或题目数量不匹配，使用初始状态
                const initialSelectedOptions = new Array(res.length).fill(null).map(() => []);
                const initialOptionStates = res.map(question => {
                    // 确保 options 存在，如果不存在则默认为空数组
                    const options = Array.isArray(question.options) ? question.options : [];
                    return new Array(options.length).fill(false);
                });

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
        // 如果已经提交，不允许再选择
        if (this.data.isSubmitted) {
            return;
        }
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
        // 如果已经提交，不允许再选择
        if (this.data.isSubmitted) {
            return;
        }
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
        
        // 立即更新状态并保存到缓存
        this.setData({
            allAnswers: newAllAnswers,
            answerSheetStates: answerSheetStates
        }, () => {
            // 立即保存到缓存
            try {
                const cacheData = wx.getStorageSync('dailyTestAnswers') || {};
                cacheData.allAnswers = newAllAnswers;
                cacheData.answerSheetStates = answerSheetStates;
                wx.setStorageSync('dailyTestAnswers', cacheData);
                console.log('填空题答案已保存到缓存');
            } catch (error) {
                console.log('保存填空题答案失败：', error);
            }
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

        let remainingSeconds = 1200; // 初始倒计时时间（20分钟）
        // 取较小值作为实际倒计时时间
        remainingSeconds = Math.min(remainingSeconds, endOfDaySeconds);

        this.startCountdownWithTime(remainingSeconds);
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

        // 计算使用的时间
        const endTime = new Date().getTime();
        const usedTime = endTime - startTime;
        const minutes = Math.floor(usedTime / (1000 * 60));
        addLearnTime(minutes).then(res => {
            console.log('传时间', minutes);
        });

        // 调用后端接口
        apiDailyJudgeTest(allUserAnswers).then(response => {
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

            // 缓存用户的答题数据
            try {
                const answerData = {
                    selectedOptions: this.data.selectedOptions,
                    optionStates: this.data.optionStates,
                    allAnswers: this.data.allAnswers,
                    questionStates: newQuestionStates,
                    questionAnalysis: newQuestionAnalysis,
                    correctAnswers: newCorrectAnswers,
                    timestamp: new Date().getTime()
                };
                wx.setStorageSync('dailyTestAnswerData', answerData);
                console.log('答题数据已缓存');
            } catch (error) {
                console.error('缓存答题数据失败：', error);
            }

            this.setData({
                isAllSubmitted: true,
                questionStates: newQuestionStates,
                isSubmitted: true,
                questionAnalysis: newQuestionAnalysis,
                correctAnswers: newCorrectAnswers,
                ifFinash: 100 // 设置完成状态
            }, () => {
                // 提交成功后清除答题进度缓存，但保留答题数据缓存
                this.clearCachedAnswers();
            });
        })
        .catch(error => {
            console.error('提交答案到后端时出错：', error);
            wx.showToast({
                title: '提交失败，请重试',
                icon: 'none'
            });
        });

        const totalCount = this.data.totalQuestions;
        dailyQuestionCount(totalCount).then(res => {
            console.log(res, '请求成功');
        });
    },
    onTouchStart: function (e) {
        // 在这里添加触摸开始事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    onTouchEnd: function (e) {
        // 在这里添加触摸结束事件的处理逻辑，如果暂时没有逻辑，可以先空着
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
            answerSheetStates,
            questionStates,
            isSubmitted
        } = this.data;
        
        const questionStatuses = answerSheetStates.map((state, index) => ({
            index: index + 1,
            isAnswered: state,
            highlightClass: isSubmitted ? (questionStates[index] ? 'correct' : 'wrong') : (state ? 'answered' : 'unanswered')
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
                allAnswers: this.data.allAnswers, // 确保填空题答案被缓存
                startTime: this.data.startTime,
                totalQuestions: this.data.totalQuestions,
                timestamp: new Date().getTime()
            };
            wx.setStorageSync('dailyTestAnswers', cacheData);
            console.log('答题状态已缓存，开始时间：', new Date(this.data.startTime));
        } catch (error) {
            console.log('缓存答题状态失败：', error);
        }
    },
    // 清除缓存的答案
    clearCachedAnswers: function() {
        try {
            // 只清除答题进度缓存，保留答题数据缓存
            const cachedData = wx.getStorageSync('dailyTestAnswers');
            if (cachedData) {
                delete cachedData.cachedAnswers;
                delete cachedData.currentQuestion;
                delete cachedData.selectedOptions;
                delete cachedData.optionStates;
                delete cachedData.answerSheetStates;
                delete cachedData.allAnswers;
                delete cachedData.startTime;
                delete cachedData.totalQuestions;
                delete cachedData.timestamp;
                wx.setStorageSync('dailyTestAnswers', cachedData);
            }
            console.log('答题进度缓存已清除');
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
        // 只在未完成答题且有开始时间的情况下重新开始倒计时
        if (!this.data.isAllSubmitted && this.data.startTime > 0) {
            this.restartCountdown();
        }
        // 重新获取用户完成情况
        this.userFinash();
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
            apiDailyJudgeTest(allUserAnswers).then(response => {
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
        // 如果已经提交，确保答题数据被缓存
        else if (this.data.isSubmitted) {
            try {
                const answerData = {
                    selectedOptions: this.data.selectedOptions,
                    optionStates: this.data.optionStates,
                    allAnswers: this.data.allAnswers,
                    questionStates: this.data.questionStates,
                    questionAnalysis: this.data.questionAnalysis,
                    correctAnswers: this.data.correctAnswers,
                    timestamp: new Date().getTime()
                };
                wx.setStorageSync('dailyTestAnswerData', answerData);
            } catch (error) {
                console.error('缓存答题数据失败：', error);
            }
        }
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
            
            // 计算缩放比例
            let scale = this.data.baseScale * (distance / this.data.startDistance);
            
            // 限制缩放范围
            scale = Math.max(0.5, Math.min(4, scale));
            
            this.setData({ scale });
        }
    },

    // 处理缩放结束
    touchEnd: function() {
        this.setData({
            transition: 'transform 0.3s ease-in-out'
        });
        
        // 如果缩放比例小于1，自动恢复到1
        if (this.data.scale < 1) {
            this.setData({
                scale: 1
            });
        }
    },

    // 修改图片预览打开函数
    previewImage: function(e) {
        const url = e.currentTarget.dataset.url;
        this.setData({
            showImagePreview: true,
            currentPreviewImage: url,
            scale: 1,
            transition: ''
        });
    },

    // 修改关闭预览函数
    closeImagePreview: function() {
        this.setData({
            showImagePreview: false,
            currentPreviewImage: '',
            scale: 1,
            transition: ''
        });
    },
    stopPropagation: function(e) {
        // 阻止事件冒泡
        e.stopPropagation();
    },
    // 新增：获取答案信息的方法
    getAnswerInfo: function() {
        getDailyTestAnswer().then(res => {
            console.log('获取到的答案信息：', res);
            // 更新答案信息到页面数据
            const newQuestionAnalysis = {};
            const newCorrectAnswers = {};
            
            res.forEach(item => {
                newQuestionAnalysis[item.questionId] = item.analysis || '';
                newCorrectAnswers[item.questionId] = item.answer;
            });

            this.setData({
                questionAnalysis: newQuestionAnalysis,
                correctAnswers: newCorrectAnswers
            });
        }).catch(error => {
            console.error('获取答案信息失败：', error);
        });
    },
    // 新增：检查今天是否已经提交过答案
    checkTodaySubmission: function() {
        getDailyFinesh().then(res => {
            console.log('获取完成状态：', res);
            this.setData({
                ifFinash: res
            }, () => {
                if (res === 100) {
                    // 如果已完成，获取题目和答案信息
                    apiGetDailyTest().then(questions => {
                        // 处理题目数据
                        questions.forEach((question, index) => {
                            if (question.options && typeof question.options === 'string') {
                                try {
                                    question.options = JSON.parse(question.options);
                                } catch (error) {
                                    question.options = [];
                                }
                            }
                            if (question.ifPicture && question.questionsImageList) {
                                try {
                                    if (typeof question.questionsImageList === 'string') {
                                        question.questionsImageList = JSON.parse(question.questionsImageList);
                                    }
                                    question.questionsImageList = question.questionsImageList.map(img => ({
                                        ...img,
                                        fullImageUrl: this.data.baseImageUrl + img.imageUrl
                                    }));
                                } catch (error) {
                                    question.questionsImageList = [];
                                }
                            } else {
                                question.questionsImageList = [];
                            }
                        });

                        // 获取缓存的答题数据
                        const cachedAnswerData = wx.getStorageSync('dailyTestAnswerData');
                        if (cachedAnswerData) {
                            // 创建答题卡状态数组
                            const answerSheetStates = new Array(questions.length).fill(true);
                            const questionStatuses = answerSheetStates.map((state, index) => ({
                                index: index + 1,
                                isAnswered: true,
                                highlightClass: cachedAnswerData.questionStates[index] ? 'correct' : 'wrong'
                            }));

                            this.setData({
                                allQuestions: questions,
                                totalQuestions: questions.length,
                                selectedOptions: cachedAnswerData.selectedOptions,
                                optionStates: cachedAnswerData.optionStates,
                                allAnswers: cachedAnswerData.allAnswers,
                                questionStates: cachedAnswerData.questionStates,
                                questionAnalysis: cachedAnswerData.questionAnalysis,
                                correctAnswers: cachedAnswerData.correctAnswers,
                                isSubmitted: true,
                                isAllSubmitted: true,
                                answerSheetStates: answerSheetStates,
                                questionStatuses: questionStatuses
                            });
                        } else {
                            // 如果没有缓存的答题数据，只显示题目
                            this.setData({
                                allQuestions: questions,
                                totalQuestions: questions.length
                            });
                        }
                    });
                } else {
                    // 如果未完成，检查是否有未完成的答题进度
                    const cachedData = wx.getStorageSync('dailyTestAnswers');
                    if (cachedData) {
                        // 有未完成的答题进度，恢复数据
                        this.getData();
                        this.checkCacheAndStartTimer();
                    } else {
                        // 没有未完成的答题进度，开始新的答题
                        this.startNewTest();
                    }
                }
            });
        }).catch(error => {
            console.error('获取完成状态失败：', error);
            this.clearAllCache();
            this.startNewTest();
        });
    },
    // 新增：清除所有缓存的方法
    clearAllCache: function() {
        try {
            // 清除所有相关的缓存
            wx.removeStorageSync('dailyTestAnswers');
            wx.removeStorageSync('dailyTestAnswerData');
            console.log('所有缓存已清除');
        } catch (error) {
            console.error('清除缓存失败：', error);
        }
    },
    // 新增：开始新的答题
    startNewTest: function() {
        // 重置所有状态
        this.setData({
            currentQuestion: 1,
            isSubmitted: false,
            isAllSubmitted: false,
            selectedOptions: [],
            optionStates: [],
            allAnswers: [],
            questionStates: [],
            questionAnalysis: {},
            correctAnswers: {},
            startTime: new Date().getTime()
        });
        
        // 获取新题目
        this.getData();
        // 开始新的倒计时
        this.startCountdown();
    },
})