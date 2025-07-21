import { request } from "./request";
import {getUserId} from './getUserId'
// 导出个人记录
export const downLoadUserText = () => {
    const userId = getUserId()
    // console.log(data);
    return request({
        url: `/exportUserExcel?userId=${userId}`,
        method: 'GET',
    });
};