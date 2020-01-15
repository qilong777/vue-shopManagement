<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/img/heima.png" alt="logo" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-btn" @click="toggleCollpase">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          :collapse-transition="false"
          :collapse="isCollapse"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          router
          :default-active="$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <!-- 标题区 -->
            <template slot="title">
              <i :class="'iconfont icon-' + iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单区 -->
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/home/' + subItem.path"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主题 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      menuList: [],
      iconsObj: {
        '125': 'users',
        '103': 'tijikongjian',
        '101': 'shangpin',
        '102': 'danju',
        '145': 'baobiao'
      },
      isCollapse: false
    }
  },
  methods: {
    // 退出
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单列表
    async getMenuList() {
      const res = await this.$http.get('menus')
      if (res.meta.status === 200) {
        this.menuList = res.data
      } else {
        this.$message.error(res.meta.msg)
      }
    },
    // 切换菜单是否折叠
    toggleCollpase() {
      this.isCollapse = !this.isCollapse
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang='scss' scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle-btn {
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    background-color: #4a5064;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: 0 none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
</style>
