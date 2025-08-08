<template>
  <div class="roles-view">
    <!-- 页面头部信息 -->
    <div class="page-header">
      <div class="page-info">
        <h1 class="page-title">{{ isTerminal ? 'ROLE_MANAGEMENT' : '角色管理' }}</h1>
        <p class="page-description">{{ isTerminal ? 'MANAGE_AI_AGENT_ROLES' : '管理AI智能体角色' }}</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-content">
      <div class="roles-content" :class="{ 'terminal-mode': isTerminal }">
        <!-- 角色列表 -->
        <div class="roles-grid">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-grid-item v-for="role in roles" :key="role.id">
              <RoleDetail :role="role" />
            </n-grid-item>
          </n-grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { rolesApi } from '@/api/roles'
import RoleDetail from '@/components/RoleDetail.vue'
import PageLayout from '@/components/PageLayout.vue'
import type { Role } from '@/types/api'

// 响应式数据
const loading = ref(false)
const roles = ref<Role[]>([])
const searchKeyword = ref('')
const showRoleDetail = ref(false)
const selectedRole = ref<Role | null>(null)

const message = useMessage()

// 计算属性
const filteredRoles = computed(() => {
  if (!searchKeyword.value) return roles.value
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    role.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    role.type.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const totalRoles = computed(() => roles.value.length)

// 方法
const handleRefresh = async () => {
  loading.value = true
  try {
    const response = await rolesApi.list()
    roles.value = response.data || []
  } catch (error) {
    console.error('获取角色列表失败:', error)
    message.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const handleEditRole = (role: Role) => {
  selectedRole.value = role
  showRoleDetail.value = true
}

// 生命周期
onMounted(() => {
  handleRefresh()
})
</script>

<style scoped lang="scss">
.roles-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background-color-1);
}

.page-header {
  padding: 24px 32px;
  background-color: var(--background-color-2);
  border-bottom: 1px solid var(--border-color-1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-1);
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: var(--text-color-2);
}

.page-content {
  flex: 1;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.roles-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  background-color: var(--background-color-1);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &.terminal-mode {
    background-color: var(--background-color-3);
    box-shadow: none;
  }
}

.roles-stats {
  flex-shrink: 0;
}

.roles-grid {
  flex: 1;
  overflow: hidden;
  
  .roles-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }
}

.role-card {
  height: fit-content;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .role-name {
    font-weight: 600;
    color: var(--text-color-1);
  }
  
  .role-type {
    font-size: 12px;
    color: var(--text-color-3);
  }
  
  .role-description {
    color: var(--text-color-2);
    line-height: 1.5;
    margin: 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .roles-content {
    .roles-grid .roles-list {
      grid-template-columns: 1fr;
    }
  }
}
</style>
