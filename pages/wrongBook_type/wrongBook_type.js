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
        isLoading: true, // 新增：是否正在加载
        canSubmit: false, // 新增：是否可以提交答案
        showImagePreview: false, // 新增：是否显示自定义图片预览弹窗
        previewImageUrl: '', // 新增：预览图片的URL
        timer: null // 新增：计时器
    },
    onLoad(options) {
        const type = decodeURIComponent(options.type);
        this.setData({
            type,
            startTime: new Date() // 记录开始时间
        });
        console.log(type);
        this.getData();
        // 启动计时器
        this.startTimer();
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
        const { allQuestions, allAnswers, selectedOptions, questionStates, currentQuestion, startTime, isSubmitted } = this.data;
        const question = allQuestions[currentQuestion - 1];

        // 基础检查
        if (!question || !question.questionId) {
            console.error('题目数据异常:', question);
            return;
        }

        // 检查是否已提交
        if (isSubmitted[currentQuestion - 1]) {
            wx.showToast({
                title: '该题目已提交',
                icon: 'none'
            });
            return;
        }

        // 验证答案
        let userAnswerToSubmit = '';

        // 单选题或判断题
        if (question.type === '单选题' || question.type === '判断题') {
            const selectedChar = selectedOptions[currentQuestion - 1];
            if (!selectedChar) {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none'
                });
                return;
            }
            userAnswerToSubmit = selectedChar;
        }
        // 多选题
        else if (question.type === '多选题') {
            const selectedChars = selectedOptions[currentQuestion - 1] || [];
            if (!selectedChars || selectedChars.length === 0) {
                wx.showToast({
                    title: '请选择答案',
                    icon: 'none'
                });
                return;
            }
            userAnswerToSubmit = selectedChars.sort().join('');
        }
        // 填空题
        else if (question.type === '填空题') {
            const userAnswer = allAnswers[currentQuestion - 1];
            if (!userAnswer || userAnswer.trim() === '') {
                wx.showToast({
                    title: '请输入答案',
                    icon: 'none'
                });
                return;
            }
            userAnswerToSubmit = userAnswer;
        }

        // 再次确认是否有答案
        if (!userAnswerToSubmit) {
            wx.showToast({
                title: '请选择答案',
                icon: 'none'
            });
            return;
        }

        // 准备提交数据
        const data = [{
            questionId: question.questionId,
            answer: userAnswerToSubmit,
            type: this.data.type
        }];

        // 提交答案
        apiJudgeTest(data)
            .then(response => {
                if (!response || !response[0]) {
                    throw new Error('服务器响应异常');
                }

                // 更新状态
                const newQuestionStates = [...questionStates];
                const newIsSubmitted = [...isSubmitted];
                newQuestionStates[currentQuestion - 1] = response[0].rightOrWrong === '对';
                newIsSubmitted[currentQuestion - 1] = true;

                // 更新题目状态
                const newAllQuestions = [...allQuestions];
                newAllQuestions[currentQuestion - 1].isFinished = true;

                this.setData({
                    questionStates: newQuestionStates,
                    isSubmitted: newIsSubmitted,
                    detailData: response[0],
                    allQuestions: newAllQuestions
                });

                // 计算并上传学习时间
                const endTime = new Date();
                const durationInMinutes = Math.floor((endTime - startTime) / (1000 * 60));
            })
            .catch(error => {
                console.error('提交答案失败：', error);
                wx.showToast({
                    title: '提交答案失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
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
    },
    onUnload: function () {
        // 清除计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        
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
    },
    // 图片预览功能（自定义弹窗）
    previewImage(e) {
        const url = e.currentTarget.dataset.url;
        this.setData({
            showImagePreview: true,
            previewImageUrl: url
        });
    },
    closeImagePreview() {
        this.setData({
            showImagePreview: false,
            previewImageUrl: ''
        });
    },
    stopPropagation() {
        // 阻止事件冒泡，防止点击图片时关闭弹窗
    },
    // 检查是否可以提交答案
    checkCanSubmit: function() {
        const { currentQuestion, allQuestions, selectedOptions, allAnswers } = this.data;
        const question = allQuestions[currentQuestion - 1];
        let canSubmit = false;

        if (question.type === '单选题' || question.type === '判断题') {
            canSubmit = !!selectedOptions[currentQuestion - 1];
        } else if (question.type === '多选题') {
            const selectedChars = selectedOptions[currentQuestion - 1];
            canSubmit = selectedChars && selectedChars.length > 0;
        } else if (question.type === '填空题') {
            const userAnswer = allAnswers[currentQuestion - 1];
            canSubmit = userAnswer && userAnswer.trim() !== '';
        }

        this.setData({ canSubmit });
    },
    // 启动计时器
    startTimer() {
        // 清除可能存在的旧计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
        
        // 创建新的计时器，每分钟更新一次
        const timer = setInterval(() => {
            const now = new Date();
            const durationInMinutes = Math.floor((now - this.data.startTime) / (1000 * 60));
            this.setData({
                studyTime: durationInMinutes
            });
        }, 60000); // 60000毫秒 = 1分钟

        this.setData({ timer });
    }
});