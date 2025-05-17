import {
    get20Mistake
} from "../../api/get20Mistake";

Page({
    data: {
        currentQuestion: 1, // 题目序号
        totalQuestions: 0, // 总数
        allQuestions: [], // 所有题目
        selectedOptions: [], // 记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {}, // 存储当前题目的详细数据，用于弹窗显示
        answerSheetStates: [],
        showAnswerSheetModal: false,
        questionStatuses: [],
        optionStates: [],
        startTime: null,
    },
    onLoad: function () {
        this.getData()
        this.setData({
            startTime: new Date()
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
                // 处理多选题答案
                if (question.type === '多选题' && typeof question.answer === 'string') {
                    question.answer = question.answer.split('').sort();
                    // 为每个选项添加选中状态
                    question.optionStates = question.options.map(option => {
                        return question.answer.indexOf(option[0]) > -1;
                    });
                }
            })
            
            // 初始化选中选项数组和选项状态数组
            const initialSelectedOptions = new Array(res.length).fill(null).map(() => []);
            const initialOptionStates = res.map(question => {
                if (question.type === '多选题') {
                    return question.optionStates || new Array(question.options.length).fill(false);
                }
                const states = new Array(question.options.length).fill(false);
                if (states.length > 0) {
                    states[0] = true; // 默认选中第一个选项
                }
                return states;
            });

            // 初始化题目状态为已提交
            const initialQuestionStates = res.map(question => {
                if (question.type === '单选题' || question.type === '判断题') {
                    return question.answer[0] === question.answer[0];
                } else if (question.type === '多选题') {
                    return true;
                } else if (question.type === '填空题') {
                    return true;
                }
                return true;
            });

            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                questionStates: initialQuestionStates,
                selectedOptions: initialSelectedOptions.map((_, index) => {
                    if (res[index].options && res[index].options.length > 0) {
                        return res[index].options[0][0];
                    }
                    return null;
                }),
                optionStates: initialOptionStates,
                answerSheetStates: new Array(res.length).fill(true),
                isSubmitted: true
            });
        });
    },
    nextQuestion: function () {
        const { currentQuestion, totalQuestions } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
        }
    },
    prevQuestion: function () {
        const { currentQuestion } = this.data;
        if (currentQuestion > 1) {
            this.setData({
                currentQuestion: currentQuestion - 1
            });
        }
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
    // 点击答题卡的事件处理函数
    showAnswerSheet: function () {
        const { answerSheetStates } = this.data;
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
    // 关闭答题卡弹窗的函数
    closeAnswerSheetModal: function () {
        this.setData({
            showAnswerSheetModal: false
        });
    },
    // 点击答题卡上的题目跳转到对应题目的函数
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
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        console.log(`做题总时间（分钟）：${durationInMinutes}`);
    }
});