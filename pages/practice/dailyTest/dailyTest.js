import {
    apiGetDailyTest
} from "../../../api/getDailyTest";
import {
    apiJudgeTest
} from "../../../api/judgeTest"

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
        remainingTime: '20:00', //倒计时
        allAnswers: [], // 所有题目答案
        isSubmitted: false,
        isAllSubmitted: false,
        allQuestions: [], //所有题目
        selectedOptions: [], //记录每个题目的选中选项
        questionStates: [] // 记录每个题目的答题状态（正确/错误）
    },
    onLoad: function () {
        this.getData()
    },
    // 请求接口
    getData: function () {
        apiGetDailyTest().then(res => {
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
                selectedOptions: new Array(res.length).fill(null) // 初始化选中选项数组
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
        if (!newSelectedOptions[currentQuestion - 1]) {
            newSelectedOptions[currentQuestion - 1] = index;
        } else {
            // 如果当前题目已有选中项，先清除再设置新的选中项
            newSelectedOptions[currentQuestion - 1] = index;
        }
        this.setData({
            selectedOptions: newSelectedOptions
        });
        // 打印当前选中的选项
        console.log(`第 ${currentQuestion} 题选中的选项：`, allQuestions[currentQuestion - 1].options[index]);
    },
    // 多选题
    selectMultipleOption: function (e) {
        const { index } = e.currentTarget.dataset;
        const { currentQuestion, selectedOptions, allQuestions } = this.data;
        const newSelectedOptions = [...selectedOptions];
        if (!newSelectedOptions[currentQuestion - 1]) {
            newSelectedOptions[currentQuestion - 1] = [index];
        } else {
            const currentSelected = newSelectedOptions[currentQuestion - 1];
            const optionIndex = currentSelected.indexOf(index);
            if (optionIndex > -1) {
                currentSelected.splice(optionIndex, 1);
            } else {
                currentSelected.push(index);
            }
        }
        this.setData({
            selectedOptions: newSelectedOptions
        });
        // 打印当前选中的多个选项
        const selectedIndices = newSelectedOptions[currentQuestion - 1] || [];
        const selectedAnswers = selectedIndices.map(i => allQuestions[currentQuestion - 1].options[i]);
        console.log(`第 ${currentQuestion} 题选中的选项：`, selectedAnswers);
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
    // 开始倒计时
    startCountdown: function () {
        this.clearCountdown();
        let remainingSeconds = 1200;
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
        const { allQuestions, allAnswers, selectedOptions, questionStates } = this.data;
        const newQuestionStates = [...questionStates];
        allQuestions.forEach((question, index) => {
            const userAnswer = allAnswers[index];
            const correctAnswer = question.answer;
            let isCorrect;
            if (question.type === '单选题' || question.type === '判断题') {
                const selectedIndex = selectedOptions[index];
                if (selectedIndex!== undefined) {
                    isCorrect = question.options[selectedIndex] === correctAnswer;
                } else {
                    isCorrect = false;
                }
            } else if (question.type === '多选题') {
                const selectedIndices = selectedOptions[index] || [];
                const userSelectedAnswers = selectedIndices.map(i => question.options[i]);
                isCorrect = userSelectedAnswers.every(answer => correctAnswer.includes(answer)) && correctAnswer.length === userSelectedAnswers.length;
            } else if (question.type === '填空题') {
                isCorrect = userAnswer === correctAnswer;
            }
            newQuestionStates[index] = isCorrect;
        });
        this.setData({
            isAllSubmitted: true,
            questionStates: newQuestionStates,
            isSubmitted: true
        });
        console.log('提交结果：', newQuestionStates); // 打印出答题结果

        // 打印所有题目选中的选项
        console.log('所有题目选中的选项：', selectedOptions.map((selected, index) => {
            const question = allQuestions[index];
            if (question.type === '多选题') {
                return selected? selected.map(i => question.options[i]) : [];
            } else {
                return selected!== null? question.options[selected] : null;
            }
        }));
    },
    onTouchStart: function (e) {
        // 在这里添加触摸开始事件的处理逻辑，如果暂时没有逻辑，可以先空着
    },
    onTouchEnd: function (e) {
        // 在这里添加触摸结束事件的处理逻辑，如果暂时没有逻辑，可以先空着
    }
})    