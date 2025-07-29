import { request } from "./request";

export const getCategotyListApi = (data) => {
    console.log(data);
    const category =data
    // const userId = getUserId()
    // console.log(data);
    return request({
        url: `/categoryList/getCategoryList?category=${category}`,
        method: 'GET',
    });
};

