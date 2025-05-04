import {
    getAllQuestion
} from '../../../api/admin'
import {
    apiJudgeTest
} from '../../../api/judgeTest'

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
        currentQuestion: 1, //题目序号
        totalPages: 0,
        pageNum: 1,
        pageSize: 10,
        type: '',
        category: '',
        questionTypes: ['单选', '多选', '填空'],

        //  查看详情
        detailData: {},

        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        studyTime: 0, // 学习时长
        allAnswers: [], // 所有题目答案
        isSubmitted: [], // 记录每道题是否提交
        questionList: [], //所有题目
        selectedOptions: [], //记录每个题目的选中选项
        questionStates: [], // 记录每个题目的答题状态（正确/错误）
        showAnalysis: false, // 控制答案解析弹窗的显示状态
        currentQuestionData: {} // 存储当前题目的详细数据，用于弹窗显示
    },
    onLoad(options) {
        const category = decodeURIComponent(options.category);
        const type = decodeURIComponent(options.questionType);
        this.setData({
            category,
            type
        });
        console.log('接收到的类别:', category);
        console.log('接收到的类别:', type);
        // this.getData();
        // 假设这里接收学习时长，可根据实际情况修改
        this.setData({
            studyTime: 0 // 初始学习时长为0
        });
        this.loadQuestions()

    },
    // 请求接口
    loadQuestions() {
        const {
            pageNum,
            pageSize
        } = this.data;
        const data = {
            category: "",
            content: "",
            pageNum: pageNum,
            pageSize: pageSize
            // 需要加type,等后端
        };

        getAllQuestion(data).then(res => {
            console.log('获取到的题目数据:', res);
            // 对获取到的questionList中的每个题目进行处理
            const questionList = res.pageInfo.pageData.map(question => {
                if (question.options) {
                    try {
                        question.options = JSON.parse(question.options);
                    } catch (error) {
                        console.error('解析options失败:', error);
                    }
                }
                // 打印每个题目的数据，检查是否有questionId
                console.log('单个题目数据:', question);
                return question;
            });
            this.setData({
                questionList,
                totalQuestions: res.pageInfo.totalSize,
                questionList: questionList,
                questionStates: new Array(questionList.length).fill(null), // 初始化题目状态数组
                selectedOptions: new Array(questionList.length).fill(null), // 初始化选中选项数组
                isSubmitted: new Array(questionList.length).fill(false) // 初始化题目提交状态数组
            });
            console.log('设置到data中的题目数据:', this.data.questionList);
            console.log(this.data.totalQuestions);
        }).catch(err => {
            console.error('加载题目列表失败:', err);
            wx.showToast({
                title: '加载题目列表失败',
                icon: 'none'
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
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            questionList
        } = this.data;
        const newSelectedOptions = [...selectedOptions];
        const question = questionList[currentQuestion - 1];
        if (question && question.options) {
            const optionFirstChar = question.options[index][0];
            newSelectedOptions[currentQuestion - 1] = optionFirstChar;
            this.setData({
                selectedOptions: newSelectedOptions
            });
            // 打印当前选中的选项首字
            console.log(`第 ${currentQuestion} 题选中的选项首字：`, optionFirstChar);
        } else {
            console.error('当前题目数据不存在或选项数据不完整');
        }
    },
    // 多选题
    selectMultipleOption: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        const {
            currentQuestion,
            selectedOptions,
            questionList
        } = this.data;

        // 确保 currentQuestion 在有效范围内
        if (currentQuestion < 1 || currentQuestion > this.data.totalQuestions) {
            return;
        }

        const newSelectedOptions = [...selectedOptions];
        const question = questionList[currentQuestion - 1];
        if (question && question.options) {
            const optionFirstChar = question.options[index][0];
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
        } else {
            console.error('当前题目数据不存在或选项数据不完整');
        }
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
    },
    submitSingleAnswer: function () {
        const {
            questionList,
            allAnswers,
            selectedOptions,
            questionStates,
            currentQuestion
        } = this.data;
        const newQuestionStates = [...questionStates];
        const newIsSubmitted = [...this.data.isSubmitted];
        const question = questionList[currentQuestion - 1];

        // 检查 currentQuestion 是否越界
        if (!question) {
            console.error('当前题目数据不存在，currentQuestion 可能越界:', currentQuestion);
            return;
        }

        const userAnswer = allAnswers[currentQuestion - 1];
        const correctAnswer = question.answer;
        let isCorrect;
        const questionId = question.questionId;
        let userAnswerToSubmit;

        if (question.type === '单选题' || question.type === '判断题') {
            const selectedChar = selectedOptions[currentQuestion - 1];
            userAnswerToSubmit = selectedChar || '';
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
        } else if (question.type === '填空题') {
            isCorrect = userAnswer === correctAnswer;
            userAnswerToSubmit = userAnswer;
        }
        newQuestionStates[currentQuestion - 1] = isCorrect;
        newIsSubmitted[currentQuestion - 1] = true;

        this.setData({
            questionStates: newQuestionStates,
            isSubmitted: newIsSubmitted
        });

        console.log('提交结果：', newQuestionStates);
        // 打印当前选中的答案
        console.log(`第 ${currentQuestion} 题提交的答案是：`, userAnswerToSubmit);

        // 打印 questionId 检查是否正确获取
        console.log('当前题目的 questionId:', questionId);

        const data = {
            questionId: questionId,
            answer: userAnswerToSubmit
        };
        console.log(data);
        // 调用后端接口
        // 判断正误
        apiJudgeTest(data).then(res => {
                console.log('后端返回结果：', res);
                // 可以在这里处理后端返回的结果，例如更新页面显示等
                this.setData({
                    detailData: res[0]
                });
                console.log(this.data.detailData);
            })
            .catch(error => {
                console.error('提交答案到后端时出错：', error);
            });
    },

    showAnalysis: function () {
        const {
            currentQuestion,
            questionList
        } = this.data;
        const currentQuestionData = questionList[currentQuestion - 1];
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
})