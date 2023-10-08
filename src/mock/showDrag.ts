//自定义点位数据
function pointData () {
  return {
    code: 200,
    data: [
      {
        pointX: 0.287,
        pointY: 0.528,
        name: '1',
        id: 22092,
      },
      {
        pointX: 0.388,
        pointY: 0.52,
        name: '2',
        id: 22093,
      },
      {
        pointX: 0.521,
        pointY: 0.491,
        name: '3',
        id: 22094,
      },
      {
        pointX: 0.659,
        pointY: 0.455,
        name: '4',
        id: 22095,
      },
    ],
    message: '请求成功',
    success: true,
  }
}
export default [
  // 获取点位信息
  {
    url: '/api/getPointData',
    method: 'get',
    response: () => {
      //如果有返回成功信息
      return pointData
    },
  },
]
