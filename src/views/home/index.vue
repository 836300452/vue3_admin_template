<template>
  <el-card>
    <div class="box">
      <img src="../../assets/images/logo.png" alt="" class="avatar" />
      <div class="bottom">
        <h3 class="title">{{ getTime() }}好呀{{ userStore.username }}</h3>
        <p class="subtitle">运维管理后台</p>
      </div>
    </div>
  </el-card>
  <div class="bottoms">
    <img src="" alt="" />
    <!-- <svg-icon name="welcome" width="600px" height="300px"></svg-icon> -->
  </div>
</template>

<script setup lang="ts">
import { getTime } from '@/utils/time'
//引入用户相关的仓库,获取当前用户的头像、昵称
import useUserStore from '@/store/modules/user'
//获取存储用户信息的仓库对象
let userStore = useUserStore()
</script>

<style scoped lang="scss">
.box {
  display: flex;

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .bottom {
    margin-left: 20px;

    .title {
      font-size: 30px;
      font-weight: 900;
      margin-bottom: 30px;
    }

    .subtitle {
      font-style: italic;
      color: skyblue;
    }
  }
}
.bottoms {
  width: 100%;
  height: 60%;
  margin-top: 10px;
  img {
    width: 500px;
    height: 100%;
    display: block;
    margin: 0 auto;
    background: url(/src/assets/images/home.jpg);
  }
}
</style>
