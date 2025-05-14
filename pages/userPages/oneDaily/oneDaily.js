import {
    apiGetoneDailyTest
} from "../../../api/getDailyTest";
import {
    apiJudgeTest
} from "../../../api/judgeTest"

Page({
    data: {
        userId:0,
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
    },
    onLoad: function (options) {
        const id = options.id
        const userId = parseInt(id)
        this.setData({
            userId:userId
        })
        console.log(this.data.userId);
        this.startCountdown()
        this.getData()
    },
    // 请求接口
    getData () {
        const userId = this.data.userId
        console.log(userId); 
        apiGetoneDailyTest(userId).then(res => {
            console.log('跳转个人daily：', res);

            res.forEach(question => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options)
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = []
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
        const { currentQuestion, totalQuestions, selectedOptions } = this.data;
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
        this.setData({
            selectedOptions: newSelectedOptions
        });
        // 打印当前选中的选项首字
        console.log(`第 ${currentQuestion} 题选中的选项首字：`, optionFirstChar);

        // 更新答题卡状态为已作答
        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        this.setData({
            answerSheetStates: answerSheetStates
        });
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

        // 更新答题卡状态为已作答
        const answerSheetStates = [...this.data.answerSheetStates];
        answerSheetStates[currentQuestion - 1] = true;
        this.setData({
            answerSheetStates: answerSheetStates
        });
    },
    // 开始倒计时
    startCountdown: function () {
        this.clearCountdown();
        // 获取当前时间
        const now = new Date();
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
            const newCorrectAnswers = {}; // 改为对象，使用questionId作为键
            
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
                    newCorrectAnswers[result.questionId] = result.answer; // 使用questionId作为键
                }
            });

            this.setData({
                isAllSubmitted: true,
                questionStates: newQuestionStates,
                isSubmitted: true,
                questionAnalysis: newQuestionAnalysis,
                correctAnswers: newCorrectAnswers // 现在correctAnswers是一个对象
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
    }
})