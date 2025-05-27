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
        remainingTime: '20:00', //倒计时显示
        startTime: 0, // 开始时间戳
        totalTime: 20 * 60, // 总时间（秒）
        timer: null, // 定时器
        isTimeUp: false, // 是否时间到
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
        ifFinash:0,
        scrollTop: 0 // 添加scrollTop控制变量
    },
    onLoad: function (options) {
        
        // 先检查今天是否已经提交过答案
        this.checkTodaySubmission();
        // 获取题目数据
        this.getData();
        // 恢复计时状态
        this.restoreTimer();
        // 获取已完成题目数据
        this.getAnswerInfo()
        
        // 检查本地存储的状态
        const savedState = wx.getStorageSync('dailyTestState');
        if (savedState) {
            this.setData({
                questionAnalysis: savedState.questionAnalysis,
                correctAnswers: savedState.correctAnswers,
                questionStates: savedState.questionStates,
                selectedOptions: savedState.selectedOptions,
                answerSheetStates: savedState.answerSheetStates,
                optionStates: savedState.optionStates,
                isSubmitted: savedState.isSubmitted,
                isAllSubmitted: savedState.isAllSubmitted,
                questionStatuses: savedState.questionStatuses
            });
        }
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
    // 添加滚动到顶部的方法
    scrollToTop() {
        // 方法1：使用选择器
        const query = wx.createSelectorQuery();
        query.select('.question-container').node().exec((res) => {
            const questionContainer = res[0];
            if (questionContainer && questionContainer.node) {
                questionContainer.node.scrollTop = 0;
            } else {
                // 方法2：使用页面滚动
                wx.pageScrollTo({
                    scrollTop: 0,
                    duration: 300
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
                currentQuestion: currentQuestion + 1,
                scrollTop: 0 // 重置滚动位置
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
                currentQuestion: currentQuestion - 1,
                scrollTop: 0 // 重置滚动位置
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
    submitAllAnswers: function() {
        const {
            allQuestions,
            allAnswers,
            selectedOptions,
            questionStates,
            answerSheetStates,
            optionStates
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

        // 收集所有答案
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
        const minutes = this.calculateUsedTime();

        // 显示加载提示
        wx.showLoading({
            title: '正在提交...',
            mask: true
        });

        // 提交学习时间
        this.submitLearningTime(minutes)
            .then(() => {
                // 调用后端接口提交答案
                return apiDailyJudgeTest(allUserAnswers);
            })
            .then(response => {
                console.log('答案提交成功，返回结果：', response);

                // 根据后端返回结果设置题目状态和解析
                const newQuestionStates = [];
                const newQuestionAnalysis = {};
                const newCorrectAnswers = {};
                const newOptionStates = this.data.allQuestions.map(question => 
                    new Array(question.options ? question.options.length : 0).fill(false)
                );
                
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

                        // 标记正确答案
                        const question = this.data.allQuestions[index];
                        if (question && question.options) {
                            const correctAnswer = result.answer;
                            
                            // 标记正确答案
                            question.options.forEach((option, optIndex) => {
                                if (option[0] === correctAnswer) {
                                    newOptionStates[index][optIndex] = true;
                                }
                            });

                            // 如果是多选题，需要处理多个正确答案
                            if (question.type === '多选题' && correctAnswer) {
                                const correctAnswers = correctAnswer.split('');
                                question.options.forEach((option, optIndex) => {
                                    if (correctAnswers.includes(option[0])) {
                                        newOptionStates[index][optIndex] = true;
                                    }
                                });
                            }
                        }
                    }
                });

                // 更新答题卡状态
                const questionStatuses = answerSheetStates.map((state, index) => ({
                    index: index + 1,
                    isAnswered: state,
                    highlightClass: newQuestionStates[index] ? 'correct' : 'wrong'
                }));

                // 更新页面状态
                this.setData({
                    isAllSubmitted: true,
                    questionStates: newQuestionStates,
                    isSubmitted: true,
                    questionAnalysis: newQuestionAnalysis,
                    correctAnswers: newCorrectAnswers,
                    optionStates: newOptionStates,
                    questionStatuses: questionStatuses,
                    ifFinash: 100
                });

                // 清除定时器
                this.clearTimer();

                // 清除本地存储的计时数据
                wx.removeStorageSync('dailyTestStartTime');

                // 提交题目数量
                return dailyQuestionCount(this.data.totalQuestions);
            })
            .then(() => {
                console.log('题目数量记录成功');
                wx.hideLoading();
                wx.showToast({
                    title: '提交成功',
                    icon: 'success'
                });
            })
            .catch(error => {
                console.error('提交过程出错：', error);
                wx.hideLoading();
                wx.showToast({
                    title: '提交失败，请重试',
                    icon: 'none'
                });
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
            currentQuestion: index,
            scrollTop: 0 // 重置滚动位置
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
        console.log(minutes);
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
            const newQuestionStates = new Array(this.data.totalQuestions).fill(null);
            const newSelectedOptions = new Array(this.data.totalQuestions).fill(null);
            const newAnswerSheetStates = new Array(this.data.totalQuestions).fill(false);
            const newOptionStates = this.data.allQuestions.map(question => 
                new Array(question.options ? question.options.length : 0).fill(false)
            );
            
            // 创建 questionId 到索引的映射
            const questionIdToIndex = {};
            this.data.allQuestions.forEach((question, index) => {
                questionIdToIndex[question.questionId] = index;
            });

            // 处理每个题目的答案信息
            res.forEach(item => {
                const index = questionIdToIndex[item.questionId];
                if (index !== undefined) {
                    // 更新题目分析
                    newQuestionAnalysis[item.questionId] = item.analysis || '';
                    // 更新正确答案
                    newCorrectAnswers[item.questionId] = item.answer;
                    // 更新题目状态（正确/错误）
                    newQuestionStates[index] = item.rightOrWrong === '对';
                    // 更新用户选择的答案
                    newSelectedOptions[index] = item.oldAnswer;
                    // 更新答题卡状态
                    newAnswerSheetStates[index] = true;

                    // 标记正确答案和用户选择的答案
                    const question = this.data.allQuestions[index];
                    if (question && question.options) {
                        const correctAnswer = item.answer;
                        const userAnswer = item.oldAnswer;
                        
                        // 标记正确答案
                        question.options.forEach((option, optIndex) => {
                            if (option[0] === correctAnswer) {
                                newOptionStates[index][optIndex] = true;
                            }
                        });

                        // 如果是多选题，需要处理多个正确答案
                        if (question.type === '多选题' && correctAnswer) {
                            const correctAnswers = correctAnswer.split('');
                            question.options.forEach((option, optIndex) => {
                                if (correctAnswers.includes(option[0])) {
                                    newOptionStates[index][optIndex] = true;
                                }
                            });
                        }
                    }
                }
            });

            // 更新页面数据，保持已提交状态
            this.setData({
                questionAnalysis: newQuestionAnalysis,
                correctAnswers: newCorrectAnswers,
                questionStates: newQuestionStates,
                selectedOptions: newSelectedOptions,
                answerSheetStates: newAnswerSheetStates,
                optionStates: newOptionStates,
                isSubmitted: this.data.isSubmitted,  // 保持原有状态
                isAllSubmitted: this.data.isAllSubmitted  // 保持原有状态
            }, () => {
                // 更新答题卡状态
                const questionStatuses = newAnswerSheetStates.map((state, index) => ({
                    index: index + 1,
                    isAnswered: state,
                    highlightClass: newQuestionStates[index] ? 'correct' : 'wrong'
                }));

                this.setData({
                    questionStatuses: questionStatuses
                });

                // 保存状态到本地存储
                wx.setStorageSync('dailyTestState', {
                    questionAnalysis: newQuestionAnalysis,
                    correctAnswers: newCorrectAnswers,
                    questionStates: newQuestionStates,
                    selectedOptions: newSelectedOptions,
                    answerSheetStates: newAnswerSheetStates,
                    optionStates: newOptionStates,
                    isSubmitted: this.data.isSubmitted,  // 保持原有状态
                    isAllSubmitted: this.data.isAllSubmitted,  // 保持原有状态
                    questionStatuses: questionStatuses
                });
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

                        this.setData({
                            allQuestions: questions,
                            totalQuestions: questions.length,
                            isSubmitted: true,  // 设置已提交状态
                            isAllSubmitted: true  // 设置已完成状态
                        });

                        // 获取答案信息
                        this.getAnswerInfo();
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
            // 只清除答题进度缓存
            wx.removeStorageSync('dailyTestAnswers');
            console.log('答题进度缓存已清除');
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
            remainingTime: '20:00',
            isTimeUp: false
        });
        
        // 获取新题目
        this.getData();
        // 开始新的倒计时
        this.startCountdown();
    },
    // 开始计时和倒计时
    startTimer: function() {
        // 清除可能存在的旧定时器
        this.clearTimer();
        
        // 记录开始时间
        const now = Date.now();
        this.setData({
            startTime: now,
            isTimeUp: false
        });

        // 保存开始时间到本地存储
        wx.setStorageSync('dailyTestStartTime', now);

        // 启动定时器
        this.data.timer = setInterval(() => {
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - this.data.startTime) / 1000);
            const remainingTime = Math.max(0, this.data.totalTime - elapsedTime);

            // 更新倒计时显示
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            this.setData({
                remainingTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            });

            // 检查是否时间到
            if (remainingTime <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    },
    // 清除定时器
    clearTimer: function() {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.data.timer = null;
        }
    },
    // 处理时间到的情况
    handleTimeUp: function() {
        this.clearTimer();
        this.setData({
            isTimeUp: true,
            remainingTime: '00:00'
        });

        // 如果用户还没有提交答案，自动提交
        if (!this.data.isSubmitted) {
            wx.showModal({
                title: '时间到',
                content: '答题时间已结束，系统将自动提交您的答案',
                showCancel: false,
                success: () => {
                    this.submitAllAnswers();
                }
            });
        }
    },
    // 恢复计时状态
    restoreTimer: function() {
        const savedStartTime = wx.getStorageSync('dailyTestStartTime');
        if (savedStartTime) {
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - savedStartTime) / 1000);
            const remainingTime = Math.max(0, this.data.totalTime - elapsedTime);

            // 如果还有剩余时间，恢复计时
            if (remainingTime > 0) {
                this.setData({
                    startTime: savedStartTime
                });
                this.startTimer();
            } else {
                // 如果时间已到，直接处理
                this.handleTimeUp();
            }
        }
    },
    // 计算答题用时（分钟）
    calculateUsedTime: function() {
        const endTime = Date.now();
        const startTime = this.data.startTime;
        if (!startTime) {
            console.warn('开始时间未记录，使用默认时间1分钟');
            return 1;
        }
        const usedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
        // 确保至少记录1分钟，最多记录20分钟
        const minutes = Math.min(Math.max(Math.ceil(usedTimeInSeconds / 60), 1), 20);
        console.log('答题用时计算：', {
            startTime: new Date(startTime).toLocaleString(),
            endTime: new Date(endTime).toLocaleString(),
            usedTimeInSeconds,
            minutes
        });
        return minutes;
    },
    // 提交学习时间
    submitLearningTime: function(minutes) {
        return new Promise((resolve, reject) => {
            if (!minutes || minutes <= 0) {
                console.warn('无效的学习时间：', minutes);
                resolve(); // 无效时间不阻止后续操作
                return;
            }

            console.log('准备提交学习时间：', minutes, '分钟');
            addLearnTime(minutes)
                .then(res => {
                    console.log('学习时间提交成功：', res);
                    resolve(res);
                })
                .catch(error => {
                    console.error('学习时间提交失败：', error);
                    // 提交失败不影响后续操作
                    resolve();
                });
        });
    },
})