import {
    getWrongQuestion,
} from "../../api/getWrongQuestion";
import { addLearnTime } from '../../api/addLearnTime'
import { apiJudgeTest } from '../../api/judgeTest'

Page({
    data: {
        type: '',
        //  查看详情
        detailData: {},

        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        studyTime: 0, // 学习时长
        allAnswers: [], // 所有题目答案
        isSubmitted: [], // 记录每道题是否提交
        allQuestions: [], //所有题目
        selectedOptions: [], //记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {}, // 存储当前题目的详细数据，用于弹窗显示
        optionStates: [], // 存储每个题目的选项状态
        startTime: null, // 记录开始时间
        answerSheetStates: [], // 记录每个题目的答案状态
        hasData: true, // 新增：是否有数据
        isLoading: true // 新增：是否正在加载
    },
    onLoad(options) {
        const type = decodeURIComponent(options.type);
        this.setData({
            type,
            startTime: new Date() // 记录开始时间
        });
        console.log(type);
        this.getData();
        // 假设这里接收学习时长，可根据实际情况修改
        this.setData({
            studyTime: 0 // 初始学习时长为0
        });
    },
    // 请求接口
    getData() {
        console.log(this.data.type);
        const type = this.data.type;
        this.setData({ isLoading: true });

        getWrongQuestion(type).then(res => {
            console.log(res);
            
            // 检查是否有数据
            if (!res || res.length === 0) {
                this.setData({
                    isLoading: false,
                    hasData: false,
                    allQuestions: [],
                    totalQuestions: 0
                });
                // 移除toast提示，改为在页面显示
                return;
            }

            res.forEach(question => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options);
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
                questionStates: new Array(res.length).fill(null), // 初始化题目状态数组
                selectedOptions: initialSelectedOptions,
                optionStates: initialOptionStates,
                answerSheetStates: new Array(res.length).fill(false),
                isLoading: false,
                hasData: true
            });
            console.log(this.data.allQuestions);
            console.log(this.data.totalQuestions);
            console.log(this.data.allQuestions[1]?.options);

        }).catch(error => {
            console.error('获取错题失败：', error);
            this.setData({
                isLoading: false,
                hasData: false,
                allQuestions: [],
                totalQuestions: 0
            });
            wx.showToast({
                title: '获取数据失败，请重试',
                icon: 'none',
                duration: 2000
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
    },
    // 多选题
    selectMultipleOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions, optionStates } = this.data;

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
    },
    submitSingleAnswer: function () {
        const { allQuestions, allAnswers, selectedOptions, questionStates, currentQuestion } = this.data;
        const question = allQuestions[currentQuestion - 1];
        let userAnswerToSubmit = '';

        // 检查是否选择了答案
        if (question.type === '单选题' || question.type === '判断题') {
            const selectedChar = selectedOptions[currentQuestion - 1];
            if (selectedChar === undefined || selectedChar === null || selectedChar === '') {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            userAnswerToSubmit = selectedChar;
        } else if (question.type === '多选题') {
            const selectedChars = selectedOptions[currentQuestion - 1];
            if (!selectedChars || selectedChars.length === 0) {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            const sortedSelectedChars = selectedChars.slice().sort();
            userAnswerToSubmit = sortedSelectedChars.join('');
        } else if (question.type === '填空题') {
            const userAnswer = allAnswers[currentQuestion - 1];
            if (!userAnswer || userAnswer.trim() === '') {
                wx.showToast({
                    title: '请输入答案',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            userAnswerToSubmit = userAnswer;
        }

        // 如果答案为空，不调用后端接口
        if (!userAnswerToSubmit) {
            wx.showToast({
                title: '请选择或输入答案',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        // 只有在有答案的情况下才继续执行
        const newQuestionStates = [...questionStates];
        const newIsSubmitted = [...this.data.isSubmitted];
        newIsSubmitted[currentQuestion - 1] = true;
        
        this.setData({
            isSubmitted: newIsSubmitted
        });
        
        const data = [{
            questionId: question.questionId,
            answer: userAnswerToSubmit,
            type: this.data.type
        }];
        console.log('提交的答案数据:', data);

        // 只有在有答案的情况下才调用接口
        if (userAnswerToSubmit) {
            apiJudgeTest(data).then(response => {
                console.log('后端返回结果：', response);
                const result = response[0];
                const isCorrect = result.rightOrWrong === '对';
                newQuestionStates[currentQuestion - 1] = isCorrect;
                this.setData({
                    questionStates: newQuestionStates,
                    detailData: result
                }, () => {
                    console.log('questionStates 更新后:', this.data.questionStates);
                });
            })
            .catch(error => {
                console.error('提交答案到后端时出错：', error);
                // 发生错误时重置提交状态
                newIsSubmitted[currentQuestion - 1] = false;
                this.setData({
                    isSubmitted: newIsSubmitted
                });
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
    onUnload: function () {
        const { startTime } = this.data;
        const endTime = new Date();
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
        console.log(`做题总时间（分钟）：${durationInMinutes}`);
        addLearnTime(durationInMinutes).then(res => {
            console.log(res);
        })
    },
    submitAnswer() {
        if (this.data.isSubmitted) return;
        
        const currentQuestion = this.data.currentQuestion - 1;
        const question = this.data.allQuestions[currentQuestion];
        const options = question.options;
        
        // 判断答案是否正确
        options.forEach(option => {
            option.isCorrect = option.selected === option.isAnswer;
        });
        
        this.setData({
            isSubmitted: true,
            [`allQuestions[${currentQuestion}].options`]: options
        });
    }
});