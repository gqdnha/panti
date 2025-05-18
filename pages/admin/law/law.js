import {
    addLawsApi,
    deleteLawApi
} from '../../../api/admin';
import { getLawsData } from '../../../api/getLaws'

Page({
    data: {
        // 法律分类选项
        regulationTypes: ['法律', '行政法规', '地方性法规','规章','标准与规范','制度与政策','其他'], 
        // 当前选择的法律分类索引
        regulationTypeIndex: 0,
        // 法律名
        regulationName: '',
        // 文件路径
        files: '',
        fileName: '',
        isAddModalVisible: false,
        // 法律列表数据
        lawList: [],
        pageNum: 1,
        totalPages: 1,
        pageSize: 10,
        // 当前选中的分类
        currentType: '法律'
    },

    onLoad(options) {
        this.loadLaws();
    },

    // 加载法律列表
    loadLaws() {
        const { pageNum, pageSize, currentType } = this.data;
        const data = {
            regulationName: "",
            pageNum: pageNum,
            pageSize: pageSize,
            regulationType: currentType // 添加分类参数
        };
        console.log(data);
        getLawsData(data).then(res => {
            console.log(res);
            if (!res.pageInfo || !res.pageInfo.pageData || res.pageInfo.pageData.length === 0) {
                this.setData({
                    lawList: [],
                    totalPages: 1,
                    pageNum: 1
                });
                wx.showToast({
                    title: '当前分类暂无数据',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            this.setData({
                lawList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.lawList);
        }).catch(err => {
            console.error(err);
            wx.showToast({
                title: '获取法律列表失败，请稍后重试',
                icon: 'none'
            });
        });
    },

    // 删除法律
    deleteLaw(e) {
        const lawId = e.currentTarget.dataset.id;
        console.log(lawId);
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这条法律文件吗？',
            success: (res) => {
                if (res.confirm) {
                    deleteLawApi(lawId).then(() => {
                        wx.showToast({
                            title: '删除成功',
                            icon:'success'
                        });
                        this.loadLaws();
                    }).catch(error => {
                        console.error('删除法律失败:', error);
                        wx.showToast({
                            title: '删除法律失败',
                            icon: 'none'
                        });
                    });
                }
            }
        });
    },

    // 添加法律
    addLaw() {
        this.setData({
            isAddModalVisible: true,
            regulationName: '',
            regulationTypeIndex: 0,
            regulationType: '法律',
            files: '',
            fileName: ''
        });
    },

    onAddModalClose() {
        this.setData({
            isAddModalVisible: false
        });
    },

    onRegulationNameInput(e) {
        this.setData({
            regulationName: e.detail.value
        });
    },

    onRegulationTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.regulationTypes[index];
        this.setData({
            regulationTypeIndex: index,
            regulationType: type
        });
    },

    // 文件上传
    uploadFile() {
        wx.chooseMessageFile({
            count: 1,
            type: 'file',
            extensions: ['pdf'],
            success: (res) => {
                const file = res.tempFiles[0];
                console.log('选择的文件信息：', file);
                
                // 检查文件大小，限制为10MB
                if (file.size > 10 * 1024 * 1024) {
                    wx.showToast({
                        title: '文件大小不能超过10MB',
                        icon: 'none'
                    });
                    return;
                }
                
                this.setData({
                    files: file.path,
                    fileName: file.name
                }, () => {
                    console.log('文件已选择，当前状态：', {
                        files: this.data.files,
                        fileName: this.data.fileName
                    });
                    wx.showToast({
                        title: '文件选择成功',
                        icon: 'success'
                    });
                });
            },
            fail: (err) => {
                console.error('选择文件失败:', err);
                wx.showToast({
                    title: '选择文件失败',
                    icon: 'none'
                });
            }
        });
    },

    // 提交新法律
    onSubmitNewLaw() {
        const {
            regulationName,
            regulationType,
            files,
            fileName
        } = this.data;
        
        console.log('提交表单数据：', {
            regulationName,
            regulationType,
            files,
            fileName
        });
        
        // 表单验证
        if (!regulationName || regulationName.trim() === '') {
            wx.showToast({
                title: '请输入法律名称',
                icon: 'none'
            });
            return;
        }

        if (this.data.regulationTypeIndex === -1) {
            wx.showToast({
                title: '请选择法律分类',
                icon: 'none'
            });
            return;
        }

        if (!files) {
            wx.showToast({
                title: '请上传PDF文件',
                icon: 'none'
            });
            return;
        }

        // 检查文件格式
        const fileExt = fileName.split('.').pop().toLowerCase();
        if (fileExt !== 'pdf') {
            wx.showToast({
                title: '只能上传PDF格式文件',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '上传中...',
            mask: true
        });

        // 使用addLawsApi上传文件
        addLawsApi(regulationType, {
            file: files,
            regulationName: regulationName
        }).then(res => {
            console.log('上传成功，响应：', res);
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
            this.onAddModalClose();
            this.loadLaws();
        }).catch(error => {
            console.error('添加法律失败:', error);
            wx.showToast({
                title: typeof error === 'string' ? error : '添加失败',
                icon: 'none',
                duration: 2000
            });
        }).finally(() => {
            wx.hideLoading();
        });
    },

    onNextPage() {
        const {
            pageNum,
            totalPages
        } = this.data;
        if (pageNum < totalPages) {
            this.setData({
                pageNum: pageNum + 1
            });
            this.loadLaws();
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    onPreviousPage() {
        const {
            pageNum
        } = this.data;
        if (pageNum > 1) {
            this.setData({
                pageNum: pageNum - 1
            });
            this.loadLaws();
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    },

    // 切换分类
    onTypeChange(e) {
        const index = e.detail.value;
        const type = this.data.regulationTypes[index];
        this.setData({
            regulationTypeIndex: index,
            currentType: type,
            pageNum: 1 // 切换分类时重置页码
        }, () => {
            this.loadLaws(); // 重新加载数据
        });
    }
});