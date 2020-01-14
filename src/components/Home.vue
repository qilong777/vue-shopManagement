<template>
  <div class>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      name: '123'
    }
  },
  methods: {
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
