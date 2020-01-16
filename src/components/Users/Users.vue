<template>
  <div class="user-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 输入框 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" clearable @clear="searchKW" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="searchKW"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="stateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip :enterable="false" effect="dark" content="编辑" placement="top">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" effect="dark" content="删除" placement="top">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="removeByUserId(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
              <el-button
                @click="showRoleDialog(scope.row)"
                type="warning"
                size="mini"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页按钮 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="$refs.addFormRef.resetFields()"
    >
      <!-- 主体区域 -->
      <el-form label-width="70px" ref="addFormRef" :model="addForm" :rules="addFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username" label="用户名">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password" label="密码">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item prop="mobile" label="手机号">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="$refs.editFormRef.resetFields()"
    >
      <!-- 主体区域 -->
      <el-form label-width="70px" ref="editFormRef" :model="editForm" :rules="editFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username" label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item prop="mobile" label="手机号">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog
      @close="selectedRoleId = ''"
      title="分配角色"
      :visible.sync="allotRoleDialogVisible"
      width="50%"
    >
      <!-- 主体区域 -->
      <p>当前的用户:{{userInfo.username}}</p>
      <p>当前的角色:{{userInfo.role_name}}</p>
      <p>
        选择角色:
        <el-select v-model="selectedRoleId" placeholder="请选择角色">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    let checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        cb()
      } else {
        cb(new Error('请输入合法邮箱'))
      }
    }
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3456789]\d{9}$/
      if (regMobile.test(value)) {
        cb()
      } else {
        cb(new Error('请输入合法手机号'))
      }
    }
    return {
      // 获取用户列表的传参
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 页面大小
        pagesize: 2
      },
      // 用户总数
      total: 0,
      // 用户列表
      userList: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 分配角色对话框的显示与隐藏
      allotRoleDialogVisible: false,
      // 添加form表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证规则
      addFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3到10个字符之间', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6到15个字符之间', trigger: 'blur' }
        ],
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 编辑form表单
      editForm: {},
      // 编辑表单验证规则
      editFormRules: {
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 用户信息
      userInfo: {},
      // 角色列表
      rolesList: [],
      // 已选择的角色Id
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const res = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status === 200) {
        this.userList = res.data.users
        this.total = res.data.total
      } else {
        this.$message.error(res.meta.msg)
      }
    },
    // 处理每页大小的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 处理当前页数的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 更新用户状态
    async stateChange(userInfo) {
      const res = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status === 200) {
        this.$message.success('用户状态更新成功!')
      } else {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('用户状态更新失败!')
      }
    },
    // 按关键字搜索
    searchKW() {
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    // 确定添加用户点击事件
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const res = await this.$http.post('users', this.addForm)
          if (res.meta.status === 201) {
            this.$message.success('用户添加成功')
            this.addDialogVisible = false
            this.getUserList()
          } else {
            this.$message.error(res.meta.msg)
          }
        } else {
          this.$message.error('用户信息不合法')
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const res = await this.$http.get('users/' + id)
      if (res.meta.status === 200) {
        this.editForm = res.data
        this.editDialogVisible = true
      } else {
        this.$message.error('查询用户失败')
      }
    },

    // 确定编辑用户事件
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const res = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status === 200) {
            this.editDialogVisible = false
            this.getUserList()
            this.$message.success('编辑用户成功')
          } else {
            this.$message.error(res.meta.msg)
          }
        } else {
          this.$message.error('用户信息不合法')
        }
      })
    },

    // 删除用户
    async removeByUserId(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'confirm') {
        const res = await this.$http.delete('users/' + id)
        if (res.meta.status === 200) {
          this.$message.success('用户删除成功')
          if (
            --this.total / this.queryInfo.pagesize <=
            this.queryInfo.pagenum
          ) {
            this.queryInfo.pagenum--
          }
          this.getUserList()
        } else {
          this.$message.error(res.meta.msg)
        }
      } else {
        this.$message.info('删除操作已取消')
      }
    },

    // 显示角色对话框
    async showRoleDialog(userInfo) {
      this.userInfo = userInfo
      const res = await this.$http.get('roles')
      if (res.meta.status === 200) {
        this.rolesList = res.data
        this.allotRoleDialogVisible = true
      } else {
        this.$message.error(res.meta.msg)
      }
    },
    // 分配角色
    async allotRole() {
      if (this.selectedRoleId) {
        const res = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        if (res.meta.status === 200) {
          this.$message.success('修改角色成功!')
          this.getUserList()
          this.allotRoleDialogVisible = false
        } else {
          this.$message.error(res.meta.msg)
        }
      } else {
        this.$message.error('请选择角色！')
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang='scss' scoped>
</style>
