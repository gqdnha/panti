import {
    addLawsApi,
    deleteLawApi
} from '../../../api/admin';
import { getLawsData } from '../../../api/getLaws'
import { baseURL } from '../../../api/request'

Page({
    data: {
        // 法律分类选项
        regulationTypes: ['类型1', '类型2', '类型3'], // 请根据实际情况修改
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
        pageSize: 10
    },

    onLoad(options) {
        this.loadLaws();
    },

    // 加载法律列表
    loadLaws() {
        const { pageNum, pageSize } = this.data;
        const data = {
            regulationName: "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getLawsData(data).then(res => {
            console.log(res);
            this.setData({
                lawList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.lawList);
        }).catch(err => {
            console.error(err);
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
            regulationTypeIndex: 0, // 重置分类索引
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
            extensions: ['doc', 'docx', 'pdf'],
            success: (res) => {
                const file = res.tempFiles[0];
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
                    console.log('文件已选择:', this.data.files);
                    wx.showToast({
                        title: '文件选择成功',
                        icon:'success'
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

    // 添加 提交
    onSubmitNewLaw() {
        const {
            regulationName,
            regulationType,
            files
        } = this.data;

        if (!regulationName) {
            wx.showToast({
                title: '请输入法律名称',
                icon: 'none'
            });
            return;
        }

        if (!regulationType) {
            wx.showToast({
                title: '请输入法律类别',
                icon: 'none'
            });
            return;
        }

        if (!files) {
            wx.showToast({
                title: '请选择要上传的文件',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '上传中...',
            mask: true
        });

        const fileName = this.data.fileName;
        wx.uploadFile({
            url: `${baseURL}/regulation/addRegulation`,
            filePath: files,
            name: 'file',
            formData: {
                regulationName,
                regulationType,
                fileName
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data);
                    if (data.code === 200) {
                        wx.showToast({
                            title: '添加成功',
                            icon:'success'
                        });
                        this.onAddModalClose();
                        this.loadLaws();
                    } else {
                        throw new Error(data.message || '添加失败');
                    }
                } catch (error) {
                    console.error('解析响应失败:', error);
                    wx.showToast({
                        title: error.message || '添加失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('上传文件失败:', error);
                wx.showToast({
                    title: '上传失败，请检查网络',
                    icon: 'none'
                });
            },
            complete: () => {
                wx.hideLoading();
            }
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
    }
});