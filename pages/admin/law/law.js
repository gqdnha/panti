import {
    addLawsApi
} from '../../../api/admin';
import {getLawsData} from '../../../api/getLaws'

Page({
    data: {
        // 法律名
        regulationName: '',
        // 文件路径
        files: '',
        isAddModalVisible: false,
        // 法律列表数据
        lawList: [],
        pageNum: 1,
        totalPages: 1,
        pageSize:10
    },

    onLoad(options) {
        this.loadLaws();
    },

    // 加载法律列表
    loadLaws() {
        const {pageNum, pageSize } = this.data;
        const data = {
            regulationName: "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getLawsData(data).then(res => {
            console.log(res);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                lawList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
        }).catch(err => {
            console.error(err);
        });
    },
    

    // 添加法律
    addLaw() {
        this.setData({
            isAddModalVisible: true,
            regulationName: '',
            files: ''
        });
    },

    onAddModalClose() {
        this.setData({
            isAddModalVisible: false
        });
    },

    onRegulationNameInput(e) {
        const value = e.detail.value;
        this.setData({
            regulationName: value
        });
        console.log(this.data.regulationName);
    },

    // 文件上传
    uploadFile() {
        wx.chooseMessageFile({
            count: 1, // 只允许选择一个文件
            type: 'file',
            extensions: ['doc', 'docx', 'pdf'], // 限制文件类型为.doc、.docx 和.pdf
            success: (res) => {
                const tempFilePaths = res.tempFiles[0].path;
                this.setData({
                    files: tempFilePaths
                }, () => {
                    console.log('files 已设置为:', this.data.files);
                });
            },
            fail: (err) => {
                console.error(' 选择文件失败:', err);
            }
        });
    },

    // 添加 提交
    onSubmitNewLaw() {
        const {
            regulationName,
            files
        } = this.data;
        if (!regulationName || !files) {
            wx.showToast({
                title: ' 请输入法律名并上传文件 ',
                icon: 'none'
            });
            return;
        }

        const fileName = files.split('/').pop();
        wx.uploadFile({
            url: `/regulation/addRegulation?regulationName=${regulationName}`,
            files: files,
            name: 'files',
            formData: {
                regulationName,
                fileName
            },
            success: (res) => {
                const data = JSON.parse(res.data);
                console.log(data);
                wx.showToast({
                    title: ' 法律添加成功 ',
                    icon:'success'
                });
                this.onAddModalClose();
                this.loadLaws();
            },
            fail: (error) => {
                console.error(' 添加法律失败:', error);
                wx.showToast({
                    title: ' 添加法律失败 ',
                    icon: 'none'
                });
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
                title: ' 已经是最后一页了 ',
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
                title: ' 已经是第一页了 ',
                icon: 'none'
            });
        }
    }
});
    