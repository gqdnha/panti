import {
    getLawsData
} from '../../../api/getLaws';
import {
    baseURL
} from '../../../api/request'
Page({
    data: {
        // 法律类型
        regulationType: '',
        pageNum: 1,
        pageSize: 10,
        totalSize: 0,
        totalPages: 0,
        lawList: [],
        isLoading: false,
        hasData: true,
        isFirstLoad: true,
        downloadingFileIndex: -1, // 当前正在下载的文件索引
        // PDF阅读器相关（保留用于下载功能）
        currentPdfInfo: null
    },

    onLoad(options) {
        const regulationType = decodeURIComponent(options.category);
        console.log('列表', regulationType);
        this.setData({
            regulationType: regulationType
        });
        this.getLawsData();
    },

    getLawsData() {
        if (this.data.isLoading) return;
        this.setData({ isLoading: true });
        
        const regulationType = this.data.regulationType;
        const { pageNum, pageSize } = this.data;
        const fromData = {
            regulationType,
            pageNum,
            pageSize
        };
        
        console.log(regulationType);
        getLawsData(fromData).then(res => {
            console.log(res);
            const totalSize = res.pageInfo.totalSize;
            const totalPages = Math.ceil(totalSize / pageSize);
            const newData = res.pageInfo.pageData || [];
            
            this.setData({
                totalSize: totalSize,
                totalPages: totalPages,
                lawList: newData, // 直接使用新数据，不进行拼接
                isLoading: false,
                hasData: newData.length > 0,
                isFirstLoad: false
            });

            if (this.data.pageNum === 1 && newData.length === 0) {
                wx.showToast({
                    title: '该分类下暂无数据',
                    icon: 'none',
                    duration: 2000
                });
            }
        }).catch((error) => {
            console.error('获取数据失败：', error);
            this.setData({ 
                isLoading: false,
                hasData: this.data.lawList.length > 0,
                isFirstLoad: false
            });
            
            if (this.data.pageNum === 1) {
                wx.showToast({
                    title: '获取数据失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    openFile(e) {
        const index = e.currentTarget.dataset.index;
        
        // 防止重复点击
        if (this.data.downloadingFileIndex === index) {
            wx.showToast({
                title: '文件正在加载中，请稍候',
                icon: 'none'
            });
            return;
        }
        
        const fileInfo = this.data.lawList[index];
        console.log(fileInfo);
        
        // 统一使用下载和打开的方式
        this.downloadAndOpenFile(fileInfo, index);
    },

    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ 
                pageNum: pageNum + 1,
                lawList: [] // 清空当前列表
            }, () => {
                this.getLawsData();
            });
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    // 下载文件功能
    downloadFile(fileInfo) {
        const baseurl = baseURL;
        const fullFileUrl = baseurl + '/static/' + fileInfo.regulation_url;
        
        wx.showLoading({
            title: '正在下载...',
            mask: true
        });
        
        wx.downloadFile({
            url: fullFileUrl,
            success: (res) => {
                if (res.statusCode === 200) {
                    wx.hideLoading();
                    wx.showToast({
                        title: '下载成功',
                        icon: 'success'
                    });
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '下载失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('下载失败：', error);
                wx.hideLoading();
                wx.showToast({
                    title: '下载失败',
                    icon: 'none'
                });
            }
        });
    },
    
    // 下载并打开文件（用于非PDF文件）
    downloadAndOpenFile(fileInfo, index) {
        const baseurl = baseURL;
        const fullFileUrl = baseurl + '/static/' + fileInfo.regulation_url;
        
        // 设置正在下载的文件索引
        this.setData({
            downloadingFileIndex: index
        });
        
        // 显示加载提示
        wx.showLoading({
            title: '正在加载文件...',
            mask: true
        });
        
        wx.downloadFile({
            url: fullFileUrl,
            success: (res) => {
                if (res.statusCode === 200) {
                    let fileType = 'pdf';
                    if (fileInfo.regulation_url.toLowerCase().endsWith('.docx')) {
                        fileType = 'docx';
                    } else if (fileInfo.regulation_url.toLowerCase().endsWith('.doc')) {
                        fileType = 'doc';
                    }
                    
                    // 隐藏加载提示
                    wx.hideLoading();
                    
                    // 重置下载状态
                    this.setData({
                        downloadingFileIndex: -1
                    });
                    
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        fileType: fileType,
                        showMenu: true,
                        success: () => {
                            wx.showToast({
                                title: '打开文档成功',
                                icon: 'success'
                            });
                        },
                        fail: (error) => {
                            console.error('打开文档失败：', error);
                            wx.showToast({
                                title: '打开文档失败',
                                icon: 'none'
                            });
                        },
                    });
                } else {
                    // 隐藏加载提示
                    wx.hideLoading();
                    // 重置下载状态
                    this.setData({
                        downloadingFileIndex: -1
                    });
                    wx.showToast({
                        title: '下载文档失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('下载文档失败：', error);
                // 隐藏加载提示
                wx.hideLoading();
                // 重置下载状态
                this.setData({
                    downloadingFileIndex: -1
                });
                wx.showToast({
                    title: '下载文档失败',
                    icon: 'none'
                });
            },
        });
    },
    
    onPreviousPage() {
        const { pageNum } = this.data;
        if (pageNum > 1) {
            this.setData({ 
                pageNum: pageNum - 1,
                lawList: [] // 清空当前列表
            }, () => {
                this.getLawsData();
            });
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    }
});    