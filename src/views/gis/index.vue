<template>
  <div class="box">
    <h3>GIS地图</h3>
    <div>
      <span>热门城市:</span>
      <el-select
        v-model="city_id"
        @change="handleCity"
        class="m-2"
        placeholder="Select"
      >
        <el-option
          placeholder="选择城市"
          v-for="item in citys"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        />
      </el-select>
      <el-select
        v-model="area_id"
        @change="hanledAreas"
        class="m-2"
        placeholder="Select"
      >
        <el-option label="选择区县" value="-1" />
        <el-option
          v-for="item in areas"
          :key="item.area_id"
          :label="item.area_name"
          :value="item.area_id"
        />
      </el-select>
    </div>
  </div>

  <div id="container"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { ref } from 'vue'
import { reqCityData, reqAreaData, reqShopsData, reqGeo } from '@/api/gis'

let map = null
let currentAMap = null //备份AMap对象

onMounted(() => {
  initMap() //初始化地图
  getCityData() //获取城市数据
})
onUnmounted(() => {
  map?.destroy()
})
//初始化方法
const initMap = () => {
  AMapLoader.load({
    key: '5462f15f7c094d8e81863dc9fe417ba0', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.HawkEye',
      'AMap.MapType',
      'AMap.Geolocation',
      'AMap.DistrictSearch',
    ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      currentAMap = AMap //备份
      map = new AMap.Map('container', {
        // 设置地图容器id
        viewMode: '3D', // 是否为3D地图模式
        zoom: 11, // 初始化地图级别
        center: [116.397428, 39.90923], // 初始化地图中心点位置
      })
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      map.addControl(new AMap.ToolBar())
      // 在图面添加比例尺控件，展示地图在当前层级和纬度下的比例尺
      map.addControl(new AMap.Scale())
      // 在图面添加鹰眼控件，在地图右下角显示地图的缩略图
      map.addControl(new AMap.HawkEye({ isOpen: true }))
      // 在图面添加类别切换控件，实现默认图层与卫星图、实施交通图层之间切换的控制
      map.addControl(new AMap.MapType())
      // 在图面添加定位控件，用来获取和展示用户主机所在的经纬度位置
      // map.addControl(new AMap.Geolocation())
    })
    .catch((e) => {
      console.log(e)
    })
}

//获取热门城市
let citys = ref([])
const city_id = ref('-1')
const getCityData = async () => {
  let res = await reqCityData()
  citys.value = res.result.hotcity
  citys.value.unshift({ code: '-1', name: '选择城市' })
}
//城市改变事件
const handleCity = (val) => {
  if (city_id.value === '-1') return false
  area_id.value = '-1'
  console.log('val', val)
  getAreasData(val)
}

//获取城市的区县
let areas = ref([])
let area_id = ref('-1')
const getAreasData = async (val) => {
  let { result } = await reqAreaData(val)
  console.log('result', result)
  let arr = Object.keys(result).map((item) => {
    return {
      area_id: item,
      area_name: result[item],
    }
  })
  areas.value = arr
}
//区县改变事件
const hanledAreas = () => {
  // 清除地图上的覆盖物(以防上一次存留)
  map.clearMap()
  if (area_id.value === '-1') return false
  getShops()
}

//获取商城信息
const getShops = async () => {
  // 清除地图上的覆盖物(以防上一次存留)
  map.clearMap()
  //根据城市+区县获取经纬度信息
  let areaName = areas.value.find(
    (item) => item.area_id == area_id.value,
  ).area_name

  //绘制区县边界
  let district = new currentAMap.DistrictSearch({
    //创建行政区查询对象
    subdistrict: 0, //获取边界不需要返回E级行政区
    extensions: 'all', //返回行政区边界坐标组等具体信息
    level: 'district', //查询行政级别为市
  })
  district.search(areaName, function (status, result) {
    let bounds = result.districtList[0].boundaries //获取朝阳区的边界信!
    console.log('bounds', bounds)
    let polygons = []
    if (bounds.length) {
      for (let i = 0; i < bounds.length; i++) {
        console.log('bounds[i]', bounds[i])
        let polygon = new currentAMap.Polygon({
          //生成行政区划
          map,
          strokeweight: 1,
          path: bounds[i],
          fillOpacity: 0.7,
          fillColor: '#CCF3FF',
          strokeColor: '#CC6CC',
        })
        polygons.push(polygon)
        console.log('polygons', polygons)
      }
      map.setFitView() //地图自适应
    }
    //调整地图的级别和中心点位位置
    map.setZoom(12)
  })

  //根据城市信息获取商城详情
  const params = {
    city_id: city_id.value,
    area_id: area_id.value,
  }
  //解构需要的参数
  let { shop_data } = await reqShopsData(params)

  //循环遍历所有的商城
  shop_data.forEach((item) => {
    let content = `
    <div style="display:flex;align-items:center">
      <div style="margin-right:5px"><img style="width:80px" src="${item.shop_ico}"/></div>
      <div style="font-size:13px;color:#333">
        <div>商城名称：${item.shop_name}</div>
        <div>商城地址：${item.shop_name}</div>
        <div>商城简介：${item.shop_desc}</div>
        </div>
    </div>
    `
    //常见marker箭头
    const marker = new currentAMap.Marker({
      //位置
      position: [item.map_longitude, item.map_latitude],
      // 标题
      title: item.show_name,
    })
    //将marker添加到地图
    map.add(marker)

    //给给个marker添加点击事件
    marker.on('click', (e) => {
      // 创建 infoWindow 实例
      let infoWindow = new currentAMap.InfoWindow({
        // 信息框的内容
        content,
        //位置偏移量
        offset: new currentAMap.Pixel(0, -30),
      })
      // 打开信息窗体(在指定的地图打开)
      infoWindow.open(map, e.target.getPosition())
    })
  })
}
</script>

<style scoped>
#container {
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
  width: 100%;
  height: 780px;
}
.box {
  border: 1px solid #ccc;
  padding: 5px;
  margin-bottom: 10px;
}
</style>
