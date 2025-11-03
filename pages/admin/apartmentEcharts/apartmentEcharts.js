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
    getLearnTimeReportApi() {
        getLearnTimeReport().then(res => {
            console.log(res, 'getLearnTimeReport');
            this.setData({
                learnTimeData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取用户完成每日答题情况报表
    getUserDailyFinishReportApi() {
        getUserDailyFinishReport().then(res => {
            console.log(res, 'getUserDailyFinishReport');
            this.setData({
                dailyFinishData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取部门人数
    getUserReportApi() {
        getUserReport().then(res => {
            console.log(res, 'getUserReport');
            this.setData({
                departmentData: res
            }, () => {
                this.updateAllCharts();
            });
        })
    },

    // 获取部门正确率
    getUserRightReportApi() {
        getUserRightReport().then(res => {
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
        const { departmentData, learnTimeData, rightRateData, dailyFinishData } = this.data;
        
        // 确保所有数据都已加载
        if (!departmentData.length || !learnTimeData.length || !rightRateData.length) {
            return;
        }

        // 准备图表数据
        const departments = departmentData.map(item => item.department);
        const userCounts = departmentData.map(item => item.userCount);
        const learnTimes = departmentData.map(dept => {
            const match = learnTimeData.find(item => item.department === dept);
            return match ? match.learnTimeReport : 0;
        });
        const rightRates = departmentData.map(dept => {
            const match = rightRateData.find(item => item.department === dept);
            return match ? match.userRightPercent : 0;
        });

        // 更新四个图表
        this.loadUserCountChart(departments, userCounts);
        this.loadLearnTimeChart(departments, learnTimes);
        this.loadRightRateChart(departments, rightRates);
        this.loadDailyFinishChart(dailyFinishData);
    },

    // 加载部门人数图表
    loadUserCountChart(departments, userCounts) {
        let ec_canvas = this.selectComponent('#userCountChart');
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
        // 获取所有数据
        this.getLearnTimeReportApi();
        this.getUserDailyFinishReportApi();
        this.getUserReportApi();
        this.getUserRightReportApi();
    },

    onChartChange(e) {
        const idx = Number(e.detail.value);
        this.setData({
            currentChart: idx
        }, () => {
            // 切换后手动初始化当前图表
            const { departmentData, learnTimeData, rightRateData, dailyFinishData } = this.data;
            const departments = departmentData.map(d => d.department);
            if (idx === 0) {
                this.loadUserCountChart(departments, departmentData.map(d => d.userCount));
            }
            if (idx === 1) {
                this.loadLearnTimeChart(
                    departments,
                    departments.map(dep => {
                        const match = learnTimeData.find(item => item.department === dep);
                        return match ? match.learnTimeReport : 0;
                    })
                );
            }
            if (idx === 2) {
                this.loadRightRateChart(
                    departments,
                    departments.map(dep => {
                        const match = rightRateData.find(item => item.department === dep);
                        return match ? match.userRightPercent : 0;
                    })
                );
            }
            if (idx === 3) {
                this.loadDailyFinishChart(dailyFinishData);
            }
        });
    },
})