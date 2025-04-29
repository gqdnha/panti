import {
    getWrongQuestion,
    apiJudgeWrongQuestion
} from "../../api/getWrongQuestion";

Page({
    data: {
        // 后端数据
        /*  questionId:'', //题目id
         content:'', //题目
         options:'', //选项
         answer:'', //答案
         isActive : '', //
         category : '', //分类
         analysis : '', //解析
         eh : '', //难易状况 */

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
        currentQuestionData: {} // 存储当前题目的详细数据，用于弹窗显示
    },
    onLoad: function () {
        this.getData();
        // 假设这里接收学习时长，可根据实际情况修改
        this.setData({
            studyTime: 0 // 初始学习时长为0
        });
    },
    // 请求接口
    getData: function () {
        getWrongQuestion().then(res => {
            console.log(res);
            res.forEach(question => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options)
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = []
                    }
                }
            })
            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                questionStates: new Array(res.length).fill(null), // 初始化题目状态数组
                selectedOptions: new Array(res.length).fill(null), // 初始化选中选项数组
                isSubmitted: new Array(res.length).fill(false) // 初始化题目提交状态数组
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
    },
    // 多选题
    selectMultipleOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions } = this.data;

        // 确保 currentQuestion 在有效范围内
        if (currentQuestion < 1 || currentQuestion > this.data.totalQuestions) {
            return;
        }

        const newSelectedOptions = [...selectedOptions];
        const optionFirstChar = allQuestions[currentQuestion - 1].options[index][0];
        if (!Array.isArray(newSelectedOptions[currentQuestion - 1])) {
            newSelectedOptions[currentQuestion - 1] = [optionFirstChar];
        } else {
            const currentSelected = newSelectedOptions[currentQuestion - 1];
            const optionIndex = currentSelected.indexOf(optionFirstChar);
            if (optionIndex > -1) {
                currentSelected.splice(optionIndex, 1);
            } else {
                currentSelected.push(optionFirstChar);
            }
        }

        // 打印更新前的 selectedOptions
        console.log('更新前的 selectedOptions:', this.data.selectedOptions);

        this.setData({
            selectedOptions: newSelectedOptions
        }, () => {
            // 打印更新后的 selectedOptions
            console.log('更新后的 selectedOptions:', this.data.selectedOptions);
            // 检查视图层是否接收到更新后的数据
            const updatedSelectedOptions = this.data.selectedOptions;
            console.log('视图层接收到的 updatedSelectedOptions:', updatedSelectedOptions);
        });

        const selectedChars = newSelectedOptions[currentQuestion - 1] || [];
        console.log(`第 ${currentQuestion} 题选中的选项首字：`, selectedChars);
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
    const newQuestionStates = [...questionStates];
    const newIsSubmitted = [...this.data.isSubmitted];
    const question = allQuestions[currentQuestion - 1];
    const userAnswer = allAnswers[currentQuestion - 1];
    const correctAnswer = question.answer;
    let isCorrect;
    const questionId = question.questionId;
    let userAnswerToSubmit;

    if (question.type === '单选题' || question.type === '判断题') {
        const selectedChar = selectedOptions[currentQuestion - 1];
        userAnswerToSubmit = selectedChar || '';
        console.log('提交的答案是：', userAnswerToSubmit); // 添加打印语句
    } else if (question.type === '多选题') {
        const selectedChars = selectedOptions[currentQuestion - 1] || [];
        const sortedSelectedChars = selectedChars.slice().sort();
        const sortedAnswerString = sortedSelectedChars.join('');
        userAnswerToSubmit = sortedAnswerString;
        // 检查 correctAnswer 是否为 null 或 undefined
        if (correctAnswer) {
            const correctFirstChars = correctAnswer.split('').map(char => char.trim());
            isCorrect = sortedAnswerString.split('').every(char => correctFirstChars.includes(char)) && correctFirstChars.length === sortedAnswerString.length;
        } else {
            isCorrect = false;
        }
        console.log('提交的答案是：', userAnswerToSubmit); // 添加打印语句
    } else if (question.type === '填空题') {
        isCorrect = userAnswer === correctAnswer;
        userAnswerToSubmit = userAnswer;
        console.log('提交的答案是：', userAnswerToSubmit); // 添加打印语句
    }
    newQuestionStates[currentQuestion - 1] = isCorrect;
    newIsSubmitted[currentQuestion - 1] = true;

    this.setData({
        questionStates: newQuestionStates,
        isSubmitted: newIsSubmitted
    });

    console.log('提交结果：', newQuestionStates);
    // 调用后端接口
    apiJudgeWrongQuestion([{
        'questionId': questionId,
        'answer': userAnswerToSubmit
    }])
      .then(response => {
            console.log('后端返回结果：', response);
            // 可以在这里处理后端返回的结果，例如更新页面显示等
        })
      .catch(error => {
            console.error('提交答案到后端时出错：', error);
        });
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
    }
})    