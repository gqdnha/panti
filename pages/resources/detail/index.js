/* import { getLawsData } from '../../';
import { baseURL } from '../../../api/request'; */

Page({
    data: {
        category:'',
        lawId: '',
        lawName: '',
        lawType: '',
        content: '',
        loading: true
    },

    onLoad(options) {
        const category = decodeURIComponent(options.category);
        console.log(category);
        this.setData({
            category:category
        });
    },
}); 