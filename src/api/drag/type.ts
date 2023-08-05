//获取点位信息需要携带参数ts类型
export interface getPointDataForm {
  id: number
}
//部分响应数据
interface responseData {
  code: number
  message: string
  success: boolean
}
interface pointData {
  id: number
  name: string
  pointX: number
  pointY: number
}
export type allPoint = pointData[]
//点位信息返回的数据类型
export interface allPointResponseData extends responseData {
  data: {
    data: allPoint
  }
}
