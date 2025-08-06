<template>
  <div class="roles-view">
    <!-- 页面操作区域 -->
    <div class="page-actions">
      <n-space>
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索角色..."
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </n-icon>
          </template>
        </n-input>
        
        <n-button @click="handleRefresh" :loading="loading">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </n-icon>
          </template>
          刷新
        </n-button>
      </n-space>
    </div>

    <!-- 角色统计 -->
    <n-card class="roles-stats" :bordered="false">
      <n-statistic label="总角色数" :value="totalRoles" />
    </n-card>

    <!-- 角色列表 -->
    <div class="roles-grid">
      <n-spin :show="loading">
        <div v-if="filteredRoles.length > 0" class="roles-list">
          <n-card
            v-for="role in filteredRoles"
            :key="role.name"
            class="role-card"
            hoverable
            @click="handleSelectRole(role)"
          >
            <template #header>
              <n-space justify="space-between" align="center">
                <div>
                  <n-text strong>{{ role.displayName }}</n-text>
                  <n-text depth="3" size="small" style="margin-left: 8px">
                    ({{ role.name }})
                  </n-text>
                </div>
                <n-icon size="20" color="var(--primary-color)">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </n-icon>
              </n-space>
            </template>

            <div class="role-description">
              <n-text depth="2">{{ role.description }}</n-text>
            </div>

            <template #action>
              <n-space>
                <n-button size="small" @click.stop="handleViewRole(role)">
                  查看详情
                </n-button>
                <n-button 
                  type="primary" 
                  size="small" 
                  @click.stop="handleUseRole(role)"
                >
                  使用角色
                </n-button>
              </n-space>
            </template>
          </n-card>
        </div>

        <!-- 空状态 -->
        <n-empty 
          v-else-if="!loading" 
          :description="searchKeyword ? '没有找到匹配的角色' : '暂无角色数据'"
        >
          <template #extra>
            <n-button @click="handleRefresh">重新加载</n-button>
          </template>
        </n-empty>
      </n-spin>
    </div>

    <!-- 角色详情抽屉 -->
    <n-drawer
      v-model:show="showRoleDetail"
      :width="600"
      placement="right"
      :mask-closable="true"
    >
      <n-drawer-content :title="selectedRole?.displayName || '角色详情'">
        <RoleDetail 
          :role="selectedRole"
          @use-role="handleUseRoleFromDetail"
          @copy-prompt="handleCopyPrompt"
        />
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { rolesApiWithMock as rolesApi } from '@/api/rolesWithMock'
import RoleDetail from '@/components/RoleDetail.vue'
import type { Role } from '@/types/api'

// 响应式数据
const loading = ref(false)
const roles = ref<Role[]>([])
const searchKeyword = ref('')
const showRoleDetail = ref(false)
const selectedRole = ref<Role | null>(null)

const message = useMessage()

// 计算属性
const totalRoles = computed(() => roles.value.length)

const filteredRoles = computed(() => {
  if (!searchKeyword.value) {
    return roles.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(keyword) ||
    role.displayName.toLowerCase().includes(keyword) ||
    role.description.toLowerCase().includes(keyword)
  )
})

// 方法
const loadRoles = async () => {
  loading.value = true
  try {
    console.log('🎭 加载角色列表...')
    const response = await rolesApi.getList()
    roles.value = response.roles || []
    
    console.log('✅ 角色列表加载成功:', {
      total: response.total,
      loaded: roles.value.length
    })
    
    message.success(`成功加载 ${roles.value.length} 个角色`)
  } catch (error: any) {
    console.error('❌ 加载角色列表失败:', error)
    message.error(`加载角色列表失败: ${error.message}`)
    roles.value = []
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadRoles()
}

const handleSelectRole = (role: Role) => {
  selectedRole.value = role
  showRoleDetail.value = true
}

const handleViewRole = (role: Role) => {
  handleSelectRole(role)
}

const handleUseRole = (role: Role) => {
  // 这里可以触发创建Agent的流程
  message.info(`准备使用角色: ${role.displayName}`)
  console.log('🎭 使用角色:', role)
  
  // TODO: 集成到Agent创建流程
  // 可以通过路由跳转到Agent创建页面，并传递角色信息
  // router.push({ name: 'create-agent', query: { role: role.name } })
}

const handleUseRoleFromDetail = (role: Role) => {
  showRoleDetail.value = false
  handleUseRole(role)
}

const handleCopyPrompt = (prompt: string) => {
  console.log('📋 提示词已复制:', prompt.substring(0, 50) + '...')
}

// 生命周期
onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="scss">
.roles-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-actions {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.roles-stats {
  margin-bottom: 24px;
}

.roles-grid {
  flex: 1;
  
  .roles-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
    
    .role-card {
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
      
      .role-description {
        min-height: 60px;
        line-height: 1.6;
        margin-bottom: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .roles-view {
    padding: 16px;
  }
  
  .roles-content .roles-grid .roles-list {
    grid-template-columns: 1fr;
  }
}
</style>
