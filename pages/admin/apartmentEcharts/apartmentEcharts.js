// 1、引入脚本
// import * as echarts from '../../ec-canvas/echarts';
import * as echarts from '../../../components/ec-canvas/echarts';

import {
    getLearnTimeReport,
    getUserDailyFinishReport,
    getUserReport,
    getUserRightReport,
} from '../../../api/getEchartsData'

Page({

    data: {
        region: '',
        chartOptions: [
            { label: '部门人数统计', value: 0 },
            { label: '部门学习时长统计', value: 1 },
            { label: '部门正确率统计', value: 2 },
            { label: '部门每日答题完成情况', value: 3 }
        ],
        currentChart: 0,
        ec: {
            lazyLoad: true // 懒加载
        },
        ec2: {
            lazyLoad: true
        },
        ec3: {
            lazyLoad: true
        },
        ec4: {
            lazyLoad: true
        },
        departmentData: [], // 存储部门数据
        learnTimeData: [], // 存储学习时长数据
        rightRateData: [], // 存储正确率数据
        dailyFinishData: [] // 存储每日完成情况数据
    },

    // 获取学习时长报表
    getLearnTimeReportApi(region) {
        console.log('获取学习时长报表，传递的region：', region);
        getLearnTimeReport(region).then(res => {
            console.log(res, 'getLearnTimeReport');
            this.setData({
                learnTimeData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取用户完成每日答题情况报表
    getUserDailyFinishReportApi(region) {
        console.log('获取每日答题完成情况，传递的region：', region);
        getUserDailyFinishReport(region).then(res => {
            console.log(res, 'getUserDailyFinishReport');
            this.setData({
                dailyFinishData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取部门人数
    getUserReportApi(region) {
        console.log('获取部门人数，传递的region：', region);
        getUserReport(region).then(res => {
            console.log(res, 'getUserReport');
            this.setData({
                departmentData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取部门正确率
    getUserRightReportApi(region) {
        console.log('获取部门正确率，传递的region：', region);
        getUserRightReport(region).then(res => {
            console.log(res, 'getUserRightReport');
            this.setData({
                rightRateData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 更新所有图表
    updateAllCharts() {
        const { departmentData, learnTimeData, rightRateData, dailyFinishData, currentChart } = this.data;
        
        console.log('updateAllCharts 被调用，当前图表：', currentChart);
        console.log('departmentData：', departmentData);
        console.log('learnTimeData：', learnTimeData);
        console.log('rightRateData：', rightRateData);
        console.log('dailyFinishData：', dailyFinishData);
        
        // 根据当前显示的图表检查对应的数据
        let hasData = false;
        
        if (currentChart === 0 && departmentData.length) {
            hasData = true;
        } else if (currentChart === 1 && learnTimeData.length) {
            hasData = true;
        } else if (currentChart === 2 && rightRateData.length) {
            hasData = true;
        } else if (currentChart === 3 && dailyFinishData.length) {
            hasData = true;
        }
        
        if (!hasData) {
            console.log('当前图表所需数据未加载完成');
            return;
        }

        // 只初始化当前显示的图表
        if (currentChart === 0) {
            const departments = departmentData.map(item => item.department);
            const userCounts = departmentData.map(item => item.userCount);
            console.log('部门人数统计 - 部门：', departments, '人数：', userCounts);
            this.loadUserCountChart(departments, userCounts);
        } else if (currentChart === 1) {
            const departments = learnTimeData.map(item => item.department);
            const learnTimes = learnTimeData.map(item => item.learnTimeReport);
            console.log('学习时长统计 - 部门：', departments, '时长：', learnTimes);
            this.loadLearnTimeChart(departments, learnTimes);
        } else if (currentChart === 2) {
            const departments = rightRateData.map(item => item.department);
            const rightRates = rightRateData.map(item => item.userRightPercent);
            console.log('正确率统计 - 部门：', departments, '正确率：', rightRates);
            this.loadRightRateChart(departments, rightRates);
        } else if (currentChart === 3) {
            console.log('每日完成情况统计 - 数据：', dailyFinishData);
            this.loadDailyFinishChart(dailyFinishData);
        }
    },

    // 加载部门人数图表
    loadUserCountChart(departments, userCounts) {
        let ec_canvas = this.selectComponent('#userCountChart');
        if (!ec_canvas) {
            console.log('userCountChart组件不存在');
            return;
        }
        ec_canvas.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr
            });
            
            const option = {
                title: {
                    text: '部门人数统计',
                    left: 'center',
                    top: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    top: '15%',
                    left: '15%',
                    right: '5%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: departments,
                    axisLabel: {
                        interval: 0,
                        rotate: 273,
                        fontSize: 12,
                        margin: 15
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '人数',
                    nameLocation: 'middle',
                    nameGap: 40
                },
                series: [{
                    name: '部门人数',
                    type: 'bar',
                    data: userCounts,
                    itemStyle: {
                        color: '#91cc75'
                    }
                }]
            };
            
            chart.setOption(option);
            return chart;
        });
    },

    // 加载学习时长图表
    loadLearnTimeChart(departments, learnTimes) {
        let ec_canvas = this.selectComponent('#learnTimeChart');
        if (!ec_canvas) {
            console.log('learnTimeChart组件不存在');
            return;
        }
        ec_canvas.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr
            });
            
            const option = {
                title: {
                    text: '部门学习时长统计',
                    left: 'center',
                    top: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    top: '15%',
                    left: '15%',
                    right: '5%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: departments,
                    axisLabel: {
                        interval: 0,
                        rotate: 273,
                        fontSize: 12,
                        margin: 15
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '时长(分钟)',
                    nameLocation: 'middle',
                    nameGap: 40
                },
                series: [{
                    name: '学习时长',
                    type: 'bar',
                    data: learnTimes,
                    itemStyle: {
                        color: '#5470c6'
                    }
                }]
            };
            
            chart.setOption(option);
            return chart;
        });
    },

    // 加载正确率图表
    loadRightRateChart(departments, rightRates) {
        let ec_canvas = this.selectComponent('#rightRateChart');
        if (!ec_canvas) {
            console.log('rightRateChart组件不存在');
            return;
        }
        ec_canvas.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr
            });
            
            const option = {
                title: {
                    text: '部门正确率统计',
                    left: 'center',
                    top: 20
                },
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    top: '15%',
                    left: '15%',
                    right: '5%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: departments,
                    axisLabel: {
                        interval: 0,
                        rotate: 273,
                        fontSize: 12,
                        margin: 15
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '正确率(%)',
                    nameLocation: 'middle',
                    nameGap: 40,
                    max: 100,
                    min: 0
                },
                series: [{
                    name: '正确率',
                    type: 'line',
                    data: rightRates,
                    itemStyle: {
                        color: '#ee6666'
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最高值' },
                            { type: 'min', name: '最低值' }
                        ]
                    }
                }]
            };
            
            chart.setOption(option);
            return chart;
        });
    },

    // 加载每日完成情况图表
    loadDailyFinishChart(dailyFinishData) {
        let ec_canvas = this.selectComponent('#dailyFinishChart');
        if (!ec_canvas) {
            console.log('dailyFinishChart组件不存在');
            return;
        }
        ec_canvas.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: dpr
            });
            
            if (!dailyFinishData || !Array.isArray(dailyFinishData)) {
                console.error('每日完成数据格式错误:', dailyFinishData);
                return chart;
            }

            const option = {
                title: {
                    text: '部门每日答题完成情况',
                    left: 'center',
                    top: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: function(params) {
                        const param = params[0];
                        return `${param.name}\n完成人数：${param.value}`;
                    }
                },
                grid: {
                    top: '15%',
                    left: '5%',
                    right: '5%',
                    bottom: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: dailyFinishData.map(item => item.department),
                    axisLabel: {
                        interval: 0,
                        rotate: 273,
                        fontSize: 12,
                        margin: 15
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '完成人数',
                    nameLocation: 'middle',
                    nameGap: 40,
                    minInterval: 1
                },
                series: [{
                    name: '完成人数',
                    type: 'bar',
                    data: dailyFinishData.map(item => item.dailyFinish || 0),
                    itemStyle: {
                        color: '#73c0de'
                    },
                    markPoint: {
                        data: [
                            { type: 'max', name: '最高值' },
                            { type: 'min', name: '最低值' }
                        ]
                    }
                }]
            };
            
            chart.setOption(option);
            return chart;
        });
    },

    onLoad() {
        const region = wx.getStorageSync('region') || '0';
        console.log('当前用户region：', region);
        this.setData({
            region: region
        });
        
        // 直接传递 region 参数获取数据
        this.getLearnTimeReportApi(region);
        this.getUserDailyFinishReportApi(region);
        this.getUserReportApi(region);
        this.getUserRightReportApi(region);
    },

    onChartChange(e) {
        const idx = Number(e.detail.value);
        this.setData({
            currentChart: idx
        }, () => {
            // 切换后直接调用 updateAllCharts 来初始化图表
            this.updateAllCharts();
        });
    },
})