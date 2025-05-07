import {
    get20Mistake
} from "../../api/get20Mistake";
import {addLearnTime} from '../../api/addLearnTime'
import {
    apiJudgeTest
} from "../../api/judgeTest"
// import {dailyQuestionCount} from '../../api/dailyQuestionCount'
Page({
    data: {
        // 后端数据
        // 题目id
        // content: '', // 题目
        // options: '', // 选项
        // answer: '', // 答案
        // isActive: '',
        // category: '', // 分类
        // analysis: '', // 解析
        // eh: '', // 难易状况

        // 页面数据
        currentQuestion: 1, // 题目序号
        totalQuestions: 0, // 总数
        remainingTime: '20:00', // 倒计时
        allAnswers: [], // 所有题目答案
        isSubmitted: false,
        isAllSubmitted: false,
        allQuestions: [], // 所有题目
        selectedOptions: [], // 记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {}, // 存储当前题目的详细数据，用于弹窗显示

        // 新增：答题卡状态，记录每个题目是否已作答
        answerSheetStates: [],
        showAnswerSheetModal: false, // 控制答题卡弹窗的显示状态
        questionStatuses: [], // 存储题目作答情况数据
        optionStates: [], // 存储每个题目的选项状态

        startTime: null, // 新增：记录开始时间
    },
    onLoad: function () {
        this.startCountdown()
        this.getData()
        this.setData({
            startTime: new Date() // 记录开始时间
        });
    },
    // 请求接口
    getData: function () {
        get20Mistake().then(res => {
            console.log(res);
            res.forEach(question => {
                if (question.options && typeof question.options ==='string') {
                    try {
                        question.options = JSON.parse(question.options)
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = []
                    }
                }
            })
            // 初始化选中选项数组和选项状态数组
            const initialSelectedOptions = new Array(res.length).fill(null).map(() => []);
            const initialOptionStates = res.map(question =>
                new Array(question.options.length).fill(false)
            );

            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                questionStates: new Array(res.length).fill(null), // 初始化题目状态数组
                selectedOptions: initialSelectedOptions,
                optionStates: initialOptionStates,
                answerSheetStates: new Array(res.length).fill(false), // 初始化答题卡状态数组，默认都未作答
            })
            console.log(this.data.allQuestions);
            console.log(this.data.totalQuestions);
            console.log(this.data.allQuestions[1].options);

        })
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
        const { currentQuestion, selectedOptions } = this.data;
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
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions, optionStates } = this.data;

        // 获取当前题目的选项状态
        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        // 切换当前选项的状态
        currentOptionStates[index] =!currentOptionStates[index];

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
        });
    },
    onInputAnswer: function (e) {
        const { value } = e.detail;
        const { currentQuestion, allAnswers } = this.data;
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
        const { allQuestions, allAnswers, selectedOptions, questionStates, answerSheetStates } = this.data;
        const newQuestionStates = [...questionStates];
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
            const correctAnswer = question.answer;
            let isCorrect;
            const questionId = question.questionId;

            if (question.type === '单选题' || question.type === '判断题') {
                const selectedChar = selectedOptions[index];
                if (selectedChar!== undefined) {
                    isCorrect = selectedChar === correctAnswer[0];
                } else {
                    isCorrect = false;
                }
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': selectedChar || ''
                });
            } else if (question.type === '多选题') {
                const selectedChars = selectedOptions[index] || [];
                const sortedSelectedChars = selectedChars.slice().sort();
                const sortedAnswerString = sortedSelectedChars.join('');
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': sortedAnswerString
                });
                const correctFirstChars = correctAnswer.split('').map(char => char.trim());
                isCorrect = sortedAnswerString.split('').every(char => correctFirstChars.includes(char)) && correctFirstChars.length === sortedAnswerString.length;
            } else if (question.type === '填空题') {
                isCorrect = userAnswer === correctAnswer;
                allUserAnswers.push({
                    'questionId': questionId,
                    'answer': userAnswer
                });
            }
            newQuestionStates[index] = isCorrect;
        });

        this.setData({
            isAllSubmitted: true,
            questionStates: newQuestionStates,
            isSubmitted: true
        });

        console.log('提交结果：', newQuestionStates);
        // 调用后端接口
        apiJudgeTest(allUserAnswers)
           .then(response => {
                console.log('后端返回结果：', response);
                // 可以在这里处理后端返回的结果，例如更新页面显示等
            })
           .catch(error => {
                console.error('提交答案到后端时出错：', error);
            });
    },
    onTouchStart: function (e) {
        // 在这里添加触摸开始事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    onTouchEnd: function (e) {
        // 在这里添加触摸结束事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    showAnalysis: function () {
        const { currentQuestion, allQuestions } = this.data;
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
        return Array.isArray(arr) && arr.includes(item);
    },
    // 新增：点击答题卡的事件处理函数
    showAnswerSheet: function () {
        const { answerSheetStates } = this.data;
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
        const { index } = e.currentTarget.dataset;
        this.setData({
            currentQuestion: index
        });
        this.closeAnswerSheetModal();
    },
    onUnload() {
        const { startTime } = this.data;
        const endTime = new Date();
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60)); // 计算做题时间（单位：分钟）
        console.log(`做题总时间（分钟）：${durationInMinutes}`);
        addLearnTime(durationInMinutes).then(res => {
            console.log(res);
        })
    }
});