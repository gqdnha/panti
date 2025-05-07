import {
    getAllQuestion
} from '../../../api/admin'
import {
    apiJudgeTest
} from '../../../api/judgeTest'
import {
    addLearnTime
} from '../../../api/addLearnTime'
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
        currentQuestionData: {}, // 存储当前题目的详细数据，用于弹窗显示
        optionStates: [], // 存储每个题目的选项状态
        startTime: null // 新增：记录开始时间
    },
    onLoad(options) {
        const category = decodeURIComponent(options.category);
        const type = decodeURIComponent(options.questionType);
        this.setData({
            category,
            type,
            startTime: new Date() // 记录开始时间
        });
        console.log('接收到的类别:', this.data.category);
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
            category: this.data.category,
            pageNum: pageNum,
            pageSize: pageSize,
            type: this.data.type
        };
        console.log('请求参数：', data);

        getAllQuestion(data).then(res => {
            console.log('获取到的题目数据:', res);
            // 对获取到的questionList中的每个题目进行处理
            const newQuestionList = res.pageInfo.pageData.map(question => {
                // 将question_id映射为questionId
                question.questionId = question.question_id;

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

            const currentQuestionList = this.data.questionList;
            const combinedQuestionList = currentQuestionList.concat(newQuestionList);

            // 初始化选项状态数组
            const initialOptionStates = newQuestionList.map(question =>
                new Array(question.options ? question.options.length : 0).fill(false)
            );

            this.setData({
                questionList: combinedQuestionList,
                totalQuestions: res.pageInfo.totalSize,
                questionStates: new Array(combinedQuestionList.length).fill(null),
                selectedOptions: new Array(combinedQuestionList.length).fill(null),
                isSubmitted: new Array(combinedQuestionList.length).fill(false),
                pageNum: this.data.pageNum + 1,
                optionStates: [...this.data.optionStates, ...initialOptionStates]
            });

            console.log('设置到data中的题目数据:', this.data.questionList);
            console.log('当前题目总数:', this.data.totalQuestions);
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
            questionList
        } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
            // 检查是否需要加载新的题目
            if (currentQuestion + 1 >= questionList.length - 2) {
                this.loadQuestions();
            }
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
            questionList,
            optionStates
        } = this.data;

        // 检查数据是否存在
        if (!questionList || !questionList[currentQuestion - 1] || !questionList[currentQuestion - 1].options) {
            console.error('题目数据不完整');
            return;
        }

        // 获取当前题目的选项状态
        let currentOptionStates = [...optionStates[currentQuestion - 1]];
        // 切换当前选项的状态
        currentOptionStates[index] = !currentOptionStates[index];

        // 更新选中选项
        let currentSelected = [];
        currentOptionStates.forEach((isSelected, idx) => {
            if (isSelected && questionList[currentQuestion - 1].options[idx]) {
                currentSelected.push(questionList[currentQuestion - 1].options[idx][0]);
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

        // 检查questionId是否存在
        if (!question.questionId) {
            console.error('当前题目缺少questionId:', question);
            return;
        }

        const userAnswer = allAnswers[currentQuestion - 1];
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
        } else if (question.type === '填空题') {
            userAnswerToSubmit = userAnswer || '';
        }

        const data = [{
            questionId: questionId,
            answer: userAnswerToSubmit,
            type: this.data.type
        }];
        console.log('提交到后端的数据：', data);

        // 调用后端接口
        // 判断正误
        apiJudgeTest(data).then(res => {
            console.log('后端返回结果：', res);
            // 使用后端返回的rightOrWrong字段更新题目状态
            newQuestionStates[currentQuestion - 1] = res[0].rightOrWrong === '对';
            newIsSubmitted[currentQuestion - 1] = true;

            this.setData({
                questionStates: newQuestionStates,
                isSubmitted: newIsSubmitted,
                detailData: res[0]
            });
            console.log(this.data.detailData);
        }).catch(error => {
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
    onUnload: function () {
        const {
            startTime
        } = this.data;
        const endTime = new Date();
        const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60)); // 计算做题时间（单位：分钟）
        console.log(`做题总时间（分钟）：${durationInMinutes}`);
        addLearnTime(durationInMinutes).then(res => {
            console.log(res);
        })
    }
})