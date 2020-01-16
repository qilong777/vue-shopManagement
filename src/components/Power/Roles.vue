<template>
  <div class="roles-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bd-bottom',i1===0?'bd-top':'']"
              class="vcenter"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="i2==0?'':'bd-top'"
                  class="vcenter"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>

            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeByRoleId(scope.row.id)"
            >删除</el-button>

            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="$refs.addFormRef.resetFields()"
    >
      <!-- 主体区域 -->
      <el-form label-width="80px" ref="addFormRef" :model="addForm" :rules="addFormRules">
        <!-- 角色名称 -->
        <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <!-- 角色描述 -->
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%">
      <!-- 主体区域 -->
      <el-form label-width="80px" ref="editFormRef" :model="editForm" :rules="editFormRules">
        <!-- 用户名 -->
        <el-form-item prop="roleName" label="角色名">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree
        ref="treeRef"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        node-key="id"
        show-checkbox
        :data="rightsList"
        :props="treeProps"
      ></el-tree>
      <!-- 底部区域（确认取消） -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 权限列表数据
      rightsList: [],
      // 树形控件属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      roleId: '',
      // 默认选择的节点Id
      defKeys: [105, 116],
      // 添加对话框显示与否
      addDialogVisible: false,
      // 权限分配对话框显示与否
      setRightDialogVisible: false,
      // 添加角色数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证
      addFormRules: {
        roleName: [
          { required: true, message: '角色名字不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      // 编辑对话框显示与否
      editDialogVisible: false,
      // 编辑表单数据
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色验证
      editFormRules: {
        roleName: [
          { required: true, message: '角色名字不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const res = await this.$http.get('roles')
      if (res.meta.status === 200) {
        this.rolesList = res.data
      } else {
        this.$message.error(res.meta.msg)
      }
    },
    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const res = await this.$http.post('roles', this.addForm)
          if (res.meta.status === 201) {
            this.addDialogVisible = false
            this.$message.success('添加角色成功!')
            this.getRolesList()
          } else {
            this.$message.error(res.meta.msg)
          }
        } else {
          this.$message.error('角色信息不合法')
        }
      })
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const res = await this.$http.get('roles/' + id)
      if (res.meta.status === 200) {
        this.editForm = res.data
        this.editDialogVisible = true
      } else {
        this.$message.error(res.meta.msg)
      }
    },
    // 编辑角色
    editRole(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const res = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          if (res.meta.status === 200) {
            this.editDialogVisible = false
            this.$message.success('角色更改成功!')
            this.getRolesList()
          } else {
            this.$message.error(res.meta.msg)
          }
        } else {
          this.$message.error('角色信息不合法!')
        }
      })
    },
    // 通过Id删除角色
    async removeByRoleId(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'confirm') {
        const res = await this.$http.delete('roles/' + id)
        if (res.meta.status === 200) {
          this.$message.success('角色删除成功!')
          this.getRolesList()
        } else {
          this.$message.error(res.meta.msg)
        }
      } else {
        this.$message.info('删除操作已取消')
      }
    },

    // 通过Id删除权限
    async removeRightById(role, rightId) {
      const confirm = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirm === 'confirm') {
        const res = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status === 200) {
          role.children = res.data
          this.$message.success('权限删除成功')
        } else {
          this.$message.error(res.meta.msg)
        }
      } else {
        this.$message.info('删除操作已取消')
      }
    },

    // 显示设置权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const res = await this.$http.get('rights/tree')
      if (res.meta.status === 200) {
        this.rightsList = res.data
        this.defKeys = []
        this.getLeaf(role, this.defKeys)
        this.setRightDialogVisible = true
      } else {
        this.$message.error(res.meta.msg)
      }
    },

    // 递归获取三级权限
    getLeaf(node, arr) {
      if (node.children) {
        node.children.forEach(ele => this.getLeaf(ele, arr))
      } else {
        arr.push(node.id)
      }
    },

    // 分配权限
    async allotRights() {
      let tree = this.$refs.treeRef
      const arrStr = [
        ...tree.getCheckedKeys(),
        ...tree.getHalfCheckedKeys()
      ].join(',')
      const res = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: arrStr
      })
      if (res.meta.status === 200) {
        this.$message.success('权限分配成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      } else {
        this.$message.error(res.meta.msg)
      }
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style lang='scss' scoped>
.el-tag {
  margin: 7px;
}

.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
