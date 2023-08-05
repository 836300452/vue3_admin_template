<template>
  <div class="dashboard-container">
    <div class="dashboard-main">
      <div class="map-canvas-panel">
        <div class="img-panel" ref="imgPanel">
          <div class="img_box">
            <img
              :src="drawUrl"
              ref="drawingImage"
              @load="loadDraw"
              :style="mapStyle"
            />
          </div>
          <div class="point-map" v-show="showMap">
            <div class="img_box">
              <div
                class="coordinate-map"
                ref="coordinateMap"
                @mousewheel.prevent.stop="wheelhandle"
                @mousedown.prevent.stop="drag"
                :style="mapStyle"
              >
                <!-- 点位开始 -->
                <span
                  :class="{
                    'mask-point': true,
                  }"
                  v-for="(item, index) in pointLists"
                  :key="item.name + index"
                  :style="{
                    left: item.pointX * 100 + '%',
                    top: item.pointY * 100 + '%',
                  }"
                  @click="pointViewEvent(index, $event, item)"
                >
                  <el-icon
                    :title="item.name"
                    :class="calcWarn(item.alarmStatus).color"
                  >
                    <Aim />
                  </el-icon>
                  <div v-show="showPointTitle" :class="{ 'point-title': true }">
                    <span
                      :style="{
                        left: `calc(
                          -${getTextWith(item.name) / 2}px + 6px
                      )`,
                      }"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                </span>
                <!-- 点位结束 -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
let drawUrl = ref('../../../public/Images/dragImg.jpg')
let showMap = ref(false)
let showMapType = ref('showAll')
let pointLists = ref([
  {
    pointX: 0.287,
    pointY: 0.528,
    name: '1',
    id: 22092,
    alarmStatus: 1,
  },
  {
    pointX: 0.388,
    pointY: 0.52,
    name: '2',
    id: 22093,
    alarmStatus: 2,
  },
  {
    pointX: 0.521,
    pointY: 0.491,
    name: '3',
    id: 22094,
    alarmStatus: 3,
  },
  {
    pointX: 0.659,
    pointY: 0.455,
    name: '4',
    id: 22095,
    alarmStatus: 2,
  },
])
let zoomMax = ref(8) //放大最大的次方 就是最多滚动几次
let zoomRate = ref(1.1) //放大的倍数
let top = ref(0) //点位的绝对定位
let left = ref(0)
let width = ref(0)
let height = ref(0)
let showPointTitle = ref(false)
let zoomDifference = computed(() => {
  let difference = (zoomRate.value * 10 - 1 * 10) / 10
  return Number(difference)
})
//放大最大倍数时是几倍
let zoomMaxRate = computed(() => {
  let maxRate = Math.pow(zoomRate.value, zoomMax.value)
  return maxRate
})

let mapStyle = computed(() => {
  return {
    top: top.value + 'px',
    left: left.value + 'px',
    width: width.value + 'px',
    height: height.value + 'px',
  }
})
const imgPanel = ref()
// const imgPanelRef = ref()
const drawingImage = ref()
//初始化点位地图
const initPointMap = () => {
  let imgPanelRef = imgPanel.value //容器ref
  let imgPanelW = imgPanelRef.clientWidth //图片容器的宽
  let imgPanelH = imgPanelRef.clientHeight //图片容器的高
  let drawingImageRef = drawingImage //原图ref
  let drawNaturalWidth = drawingImageRef.value.naturalWidth //图片原始宽
  let drawNaturalHeight = drawingImageRef.value.naturalHeight //图片原始高
  let imgPanelWHRate = imgPanelW / imgPanelH //图片容器的宽高比率
  let drawNaturalWHRate = drawNaturalWidth / drawNaturalHeight //图片容器的宽高比率

  //满屏模式
  if (showMapType.value == 'fullScreen') {
    //当容器宽高比 高于原图
    if (imgPanelWHRate >= drawNaturalWHRate) {
      drawingImageRef.value.style.width = imgPanelW + 'px'
      drawingImageRef.value.style.height =
        (drawNaturalHeight / drawNaturalWidth) * imgPanelW + 'px'
      width.value = imgPanelW
      height.value = (drawNaturalHeight / drawNaturalWidth) * imgPanelW
      top.value =
        -(drawingImageRef.value.offsetHeight - imgPanelRef.value.offsetHeight) /
        2
      left.value = 0
    } else {
      drawingImageRef.value.style.height = imgPanelH + 'px'
      drawingImageRef.value.style.width =
        (drawNaturalWidth / drawNaturalHeight) * imgPanelH + 'px'
      width.value = (drawNaturalWidth / drawNaturalHeight) * imgPanelH
      height.value = imgPanelH
      top.value = 0
      left.value =
        -(drawingImageRef.value.offsetWidth - imgPanelRef.value.offsetWidth) / 2
    }
  } else if (showMapType.value == 'showAll') {
    if (imgPanelWHRate >= drawNaturalWHRate) {
      drawingImageRef.value.style.width =
        (drawNaturalWidth / drawNaturalHeight) * imgPanelH + 'px'
      drawingImageRef.value.style.height = imgPanelH + 'px'
      width.value = (drawNaturalWidth / drawNaturalHeight) * imgPanelH
      height.value = imgPanelH
      left.value =
        -(drawingImageRef.value.offsetWidth - imgPanelRef.value.offsetWidth) / 2
      top.value = 0
    } else {
      drawingImageRef.value.style.width = imgPanelW + 'px'
      drawingImageRef.value.style.height =
        (drawNaturalHeight / drawNaturalWidth) * imgPanelW + 'px'
      width.value = imgPanelW
      height.value = (drawNaturalHeight / drawNaturalWidth) * imgPanelW
      left.value = 0
      top.value =
        -(drawingImageRef.value.offsetHeight - imgPanelRef.value.offsetHeight) /
        2
      // + 'px'
    }
  }
}
// 拖拽事件
const drag = (el: { currentTarget: any }) => {
  let oDiv = el.currentTarget //当前元素
  oDiv.onmousedown = function (e) {
    e.preventDefault()
    let bw = document.body.clientWidth
    let bh = document.body.clientHeight
    //鼠标按下，计算当前元素距离可视区的距离
    let disX = e.clientX - oDiv.offsetLeft
    let disY = e.clientY - oDiv.offsetTop
    // 计算两边坐标
    document.onmousemove = function (e) {
      let imgPanelRef = imgPanel.value //容器ref
      let imgPanelW = imgPanelRef.clientWidth //图片容器的宽
      let imgPanelH = imgPanelRef.clientHeight //图片容器的高
      let l = 0,
        t = 0
      if (e.clientX >= bw) {
        l = bw - disX
      } else if (e.clientX <= 0) {
        {
          l = 0 - disX
        }
      } else {
        l = e.clientX - disX
      }
      if (e.clientY >= bh) {
        t = bh - disY
      } else if (e.clientY <= 0) {
        t = 0 - disY
      } else {
        t = e.clientY - disY
      }
      if (showMapType.value == 'fullScreen') {
        if (t > 0) {
          t = 0
        } else if (t < 0 && t < imgPanelH - oDiv.clientHeight) {
          t = imgPanelH - oDiv.clientHeight
        }
        if (l > 0) {
          l = 0
        } else if (l <= 0 && l < imgPanelW - oDiv.clientWidth) {
          l = imgPanelW - oDiv.clientWidth
        }
      }

      //移动当前元素
      oDiv.style.left = l + 'px'
      oDiv.style.top = t + 'px'
      top.value = t
      left.value = l
    }
    // 鼠标停止移动时，事件移除
    document.onmouseup = function () {
      document.onmousemove = null
      document.onmouseup = null
    }
  }
}
// 全屏模式放大缩小事件
const wheelFullScreen = (event: any) => {
  let imgPanelRef = imgPanel.value //容器ref
  if (!imgPanelRef) return
  let imgPanelW = imgPanelRef.clientWidth //图片容器的宽
  let imgPanelH = imgPanelRef.clientHeight //图片容器的高
  let drawingImageRef = drawingImage.value //原图ref
  let drawNaturalWidth = drawingImageRef.naturalWidth //图片原始宽
  let drawNaturalHeight = drawingImageRef.naturalHeight //图片原始高
  let imgPanelWHRate = imgPanelW / imgPanelH //图片容器的宽高比率
  let drawNaturalWHRate = drawNaturalWidth / drawNaturalHeight //图片容器的宽高比率
  //wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动
  let x = event.offsetX //离坐标盘的起始点X
  let y = event.offsetY //离坐标盘的起始点Y
  let speed = event.wheelDelta / 12 || (-event.detail * 10) / 30 //滚轮的步长
  let enlarge = speed > 0 ? 1 : -1 //是缩小还是放大 1放大 -1缩小
  let mapWidth = width.value //坐标盘宽
  let mapHeight = height.value //坐标盘高
  let mapLeft = left.value //坐标盘左偏移量
  let mapTop = top.value //坐标盘上偏移量
  //放大
  if (enlarge > 0) {
    if (imgPanelWHRate >= drawNaturalWHRate) {
      if (mapWidth <= imgPanelW * zoomMaxRate.value) {
        let newX = -x * zoomDifference.value //偏移量X
        let newY = -y * zoomDifference.value //偏移量Y
        width.value = mapWidth * zoomRate.value //放大后的坐标盘
        height.value = mapHeight * zoomRate.value //放大后的坐标盘
        let tempLeft = Number(mapLeft) + newX //坐标盘向左偏移
        let tempTop = Number(mapTop) + newY //坐标盘向上偏移
        tempLeft = tempLeft > 0 ? 0 : tempLeft //校正坐标盘脱离0,0 强制置于0,0
        tempTop = tempTop > 0 ? 0 : tempTop //校正坐标盘脱离0,0 强制置于0,0
        left.value = tempLeft
        top.value = tempTop
      } else {
        let newX = -x * zoomDifference.value //偏移量X
        let newY = -y * zoomDifference.value //偏移量Y
        width.value = mapWidth * zoomRate.value //放大后的坐标盘
        height.value = mapHeight * zoomRate.value //放大后的坐标盘
        let tempLeft = Number(mapLeft) + newX //坐标盘向左偏移
        let tempTop = Number(mapTop) + newY //坐标盘向上偏移
        tempLeft = tempLeft > 0 ? 0 : tempLeft //校正坐标盘脱离0,0 强制置于0,0
        tempTop = tempTop > 0 ? 0 : tempTop //校正坐标盘脱离0,0 强制置于0,0
        left.value = tempLeft
        top.value = tempTop
      }
    } else {
      if (mapHeight <= imgPanelH * zoomMaxRate.value) {
        let newX = -x * zoomDifference.value
        let newY = -y * zoomDifference.value
        width.value = mapWidth * zoomRate.value
        height.value = mapHeight * zoomRate.value
        let tempLeft = Number(mapLeft) + newX
        let tempTop = Number(mapTop) + newY
        tempLeft = tempLeft > 0 ? 0 : tempLeft
        tempTop = tempTop > 0 ? 0 : tempTop
        left.value = tempLeft
        top.value = tempTop
      }
    }
  } else {
    if (imgPanelWHRate >= drawNaturalWHRate) {
      if (parseInt(imgPanelW) < mapWidth) {
        width.value = mapWidth / zoomRate.value
        height.value = mapHeight / zoomRate.value
        let newX = x - x / zoomRate.value
        let newY = y - y / zoomRate.value
        let tempLeft = Number(mapLeft) + newX
        let tempTop = Number(mapTop) + newY

        tempLeft = tempLeft > 0 ? 0 : tempLeft
        tempTop = tempTop > 0 ? 0 : tempTop
        left.value = tempLeft
        top.value = tempTop
      }
    } else {
      if (parseInt(imgPanelH) < mapHeight) {
        width.value = mapWidth / zoomRate.value
        height.value = mapHeight / zoomRate.value
        let newX = x - x / zoomRate.value
        let newY = y - y / zoomRate.value
        let tempLeft = Number(mapLeft) + newX
        let tempTop = Number(mapTop) + newY
        tempLeft = tempLeft > 0 ? 0 : tempLeft
        tempTop = tempTop > 0 ? 0 : tempTop
        left.value = tempLeft
        top.value = tempTop
      }
    }
  }
}
// 没全屏模式放大缩小事件
const wheelShowAll = (event: any) => {
  let imgPanelRef = imgPanel.value //容器ref
  let imgPanelW = imgPanelRef.clientWidth //图片容器的宽
  let imgPanelH = imgPanelRef.clientHeight //图片容器的高
  let drawingImageRef = drawingImage //原图ref
  let drawNaturalWidth = drawingImageRef.value.naturalWidth //图片原始宽
  let drawNaturalHeight = drawingImageRef.value.naturalHeight //图片原始高
  let imgPanelWHRate = imgPanelW / imgPanelH //图片容器的宽高比率
  let drawNaturalWHRate = drawNaturalWidth / drawNaturalHeight //图片容器的宽高比率
  //wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动
  let x = event.offsetX //离坐标盘的起始点X
  let y = event.offsetY //离坐标盘的起始点Y
  let speed = event.wheelDelta / 12 || (-event.detail * 10) / 30 //滚轮的步长
  let enlarge = speed > 0 ? 1 : -1 //是缩小还是放大 1放大 -1缩小
  let mapWidth = width //坐标盘宽
  let mapHeight = height //坐标盘高
  let mapLeft = left //坐标盘左偏移量
  let mapTop = top //坐标盘上偏移量
  // 放大走这里
  if (enlarge > 0) {
    let newX = -x * zoomDifference.value //偏移量X
    let newY = -y * zoomDifference.value //偏移量Y
    console.log('zoomRate.value', zoomRate.value)

    width.value = mapWidth.value * zoomRate.value //放大后的坐标盘
    height.value = mapHeight.value * zoomRate.value //放大后的坐标盘
    let tempLeft = Number(mapLeft) + newX //坐标盘向左偏移
    let tempTop = Number(mapTop) + newY //坐标盘向上偏移
    left.value = tempLeft
    top.value = tempTop
  }
  // 缩小
  else {
    if (imgPanelWHRate <= drawNaturalWHRate) {
      if (parseInt(imgPanelW) < mapWidth.value) {
        width.value = mapWidth.value / zoomRate.value
        height.value = mapHeight.value / zoomRate.value
        let newX = x - x / zoomRate.value
        let newY = y - y / zoomRate.value
        let tempLeft = Number(mapLeft) + newX
        let tempTop = Number(mapTop) + newY
        tempLeft = tempLeft > 0 ? 0 : tempLeft
        left.value = tempLeft
        top.value = tempTop
      }
    } else {
      if (parseInt(imgPanelH) < mapHeight.value) {
        width.value = mapWidth.value / zoomRate.value
        height.value = mapHeight.value / zoomRate.value
        let newX = x - x / zoomRate.value
        let newY = y - y / zoomRate.value
        let tempLeft = Number(mapLeft) + newX
        let tempTop = Number(mapTop) + newY
        tempTop = tempTop > 0 ? 0 : tempTop
        left.value = tempLeft
        top.value = tempTop
      }
    }
  }
}
const wheelhandle = (event: any) => {
  //满屏模式
  if (showMapType.value == 'fullScreen') {
    wheelFullScreen(event)
  } else if (showMapType.value == 'showAll') {
    wheelShowAll(event)
  }
  return false
}
//初始化
const loadDraw = () => {
  showMap.value = true
  nextTick(() => {
    initPointMap()
  })
}

//计算位移的警告值
const calcWarn = (value: any) => {
  let config = {}
  switch (Number(value)) {
    case 1:
      config = { color: 'green' }
      break
    case 2:
      config = { color: 'danger' }
      break
    case 3:
      config = { color: 'warn' }
      break
    default:
      config = { color: 'green' }
      break
  }
  return config
}
// 获取文字宽度 -> 默认字体为table样式 14px
const getTextWith = (
  text = '',
  fontStyle = '14px/1.5715 "Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif"', // 设置字体大小和字体
) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context.font = fontStyle
  const elem = context.measureText(text)
  return elem.width
}
// 打开点位对话框
const pointViewEvent = (index, e, item) => {
  console.log('item', item)
  // this.showPointView = true;
}
</script>

<style lang="scss" scoped>
$footerHeight: 52px;
.dashboard-container {
  height: 100%;
  width: 100%;
  .dashboard-main {
    width: 100%;
    height: calc(100% - #{$footerHeight});
    .map-canvas-panel {
      height: 100%;
      width: 100%;
      position: relative;
      background: rgba(0, 0, 0, 0.15);
      .img-panel {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 0;
        .img_box {
          white-space: nowrap;
          display: inline-block;
          position: relative;
          height: 100%;
          width: 100%;
          transform: scale(1);
          transform-origin: 'top left';
        }
        .img_box > img {
          position: absolute;
        }
      }
      .point-map {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 0;
        .coordinate-map {
          position: absolute;
        }
        .mask-point {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          transform: translate(-10px, -10px);
          cursor: pointer;
          &.show {
            z-index: 2;
          }
          @keyframes light {
            from {
              opacity: 1;
            }
            to {
              opacity: 0.2;
            }
          }
          .danger {
            color: red;
            animation: light 1s linear infinite;
          }
          .warn {
            color: #fec85e;
            animation: light 1s linear infinite;
          }
          .green {
            color: green;
          }
          i {
            font-size: 20px;
          }
          .point-title {
            position: absolute;
            > span {
              font-size: 14px;
              background: rgba(0, 0, 0, 0.3);
              padding: 0 4px;
              position: relative;
            }
          }
        }
        .devicePoint {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          transform: translate(-12px, -12px);
          cursor: pointer;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          &.show {
            z-index: 2;
          }
          i {
            font-size: 14px;
          }
          .icon-shuiwei2 {
            font-size: 22px;
          }
          .point-title {
            position: absolute;
            top: 26px;
            > span {
              font-size: 14px;
              background: rgba(0, 0, 0, 0.3);
              padding: 0 4px;
              position: relative;
            }
          }
        }
        .mask-point-modal {
          position: absolute;
          width: 200px;
          padding-bottom: 10px;
          background: rgba(14, 18, 55, 0.9);
          border: 2px solid rgba(15, 163, 248, 1);
          border-radius: 6px;
          top: 8px;
          left: 25px;
          display: none;
          z-index: 22;
          &.display {
            display: block;
          }
          .mask-modal-title {
            height: 48px;
            color: #37d2ff;
            line-height: 48px;
            border-bottom: 1px solid #37d2ff;
            position: relative;
            span {
              color: #37d2ff;
              padding-left: 17px;
            }
            i {
              position: absolute;
              right: 17px;
              font-size: 14px;
              color: #46fbf5;
            }
          }
          .mark-modal-content {
            padding: 22px 17px;
          }
        }
      }
    }
  }
}
</style>
