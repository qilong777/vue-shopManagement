<template>
  <div class="login-container">
    <div class="login-box">
      <!-- logo头像框 -->
      <div class="logo-box">
        <img src="../assets/img/logo.png" alt />
      </div>

      <!-- 登陆表单 -->
      <el-form ref="loginFormRef" class="login-form" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  data() {
    return {
      // 登录表单对应的数据对象
      loginForm: {
        username: '',
        password: ''
      },
      // 登录表单验证规则
      loginFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符之间', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6到15个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 充值登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录按钮点击事件
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const res = await this.$http.post('login', this.loginForm)
          if (res.meta.status === 200) {
            this.$message.success('恭喜你，登陆成功!')
            sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          } else {
            this.$message.error('登陆失败!')
          }
        }
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
  .login-box {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    .logo-box {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      padding: 10px;
      border-radius: 50%;
      border: 1px solid #eee;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login-form {
      position: absolute;
      bottom: 0px;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
