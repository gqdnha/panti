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
        downloadingFileIndex: -1 // 当前正在下载的文件索引
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
        
        // 设置正在下载的文件索引
        this.setData({
            downloadingFileIndex: index
        });
        
        // 显示加载提示
        wx.showLoading({
            title: '正在加载文件...',
            mask: true
        });
        
        const baseurl = baseURL;
        console.log(baseurl);
        const fullFileUrl = baseurl + '/static/' + fileInfo.regulation_url;
        console.log(fullFileUrl);
        
        wx.downloadFile({
            url: fullFileUrl,
            success: (res) => {
                console.log('下载成功，响应信息：', res);
                console.log('状态码：', res.statusCode);
                console.log('临时文件路径：', res.tempFilePath);
                
                if (res.statusCode === 200) {
                    let fileType = 'pdf';
                    if (fileInfo.regulation_url.toLowerCase().endsWith('.docx')) {
                        fileType = 'docx';
                    } else if (fileInfo.regulation_url.toLowerCase().endsWith('.doc')) {
                        fileType = 'doc';
                    }
                    
                    console.log('文件类型：', fileType);
                    
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
                    console.error('下载失败，状态码：', res.statusCode);
                    // 隐藏加载提示
                    wx.hideLoading();
                    // 重置下载状态
                    this.setData({
                        downloadingFileIndex: -1
                    });
                    wx.showToast({
                        title: `下载失败，状态码：${res.statusCode}`,
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('下载文档失败：', error);
                console.error('错误详情：', {
                    errMsg: error.errMsg,
                    statusCode: error.statusCode,
                    url: fullFileUrl
                });
                
                // 隐藏加载提示
                wx.hideLoading();
                // 重置下载状态
                this.setData({
                    downloadingFileIndex: -1
                });
                
                // 根据错误类型显示不同的提示
                let errorMessage = '下载文档失败';
                if (error.errMsg && error.errMsg.includes('ENOENT')) {
                    errorMessage = '文件不存在或路径错误';
                } else if (error.errMsg && error.errMsg.includes('timeout')) {
                    errorMessage = '下载超时，请重试';
                } else if (error.statusCode) {
                    errorMessage = `下载失败，状态码：${error.statusCode}`;
                }
                
                wx.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 3000
                });
            },
        });
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