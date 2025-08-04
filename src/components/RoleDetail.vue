<template>
  <div class="role-detail">
    <n-card v-if="role" :title="role.displayName" :bordered="false">
      <template #header-extra>
        <n-tag type="info" size="small">{{ role.name }}</n-tag>
      </template>
      
      <n-space vertical :size="16">
        <!-- 角色描述 -->
        <div class="role-section">
          <h4 class="section-title">
            <n-icon :size="16" class="section-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </n-icon>
            角色描述
          </h4>
          <n-text class="role-description">{{ role.description }}</n-text>
        </div>

        <!-- 系统提示词 -->
        <div class="role-section">
          <h4 class="section-title">
            <n-icon :size="16" class="section-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
              </svg>
            </n-icon>
            系统提示词
          </h4>
          <n-scrollbar style="max-height: 200px">
            <n-code 
              :code="role.prompt" 
              language="text"
              :show-line-numbers="false"
              word-wrap
            />
          </n-scrollbar>
        </div>

        <!-- 操作按钮 -->
        <div class="role-actions">
          <n-space>
            <n-button 
              type="primary" 
              @click="handleUseRole"
              :disabled="!role"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </n-icon>
              </template>
              使用此角色
            </n-button>
            
            <n-button @click="handleCopyPrompt">
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                  </svg>
                </n-icon>
              </template>
              复制提示词
            </n-button>
          </n-space>
        </div>
      </n-space>
    </n-card>

    <!-- 加载状态 -->
    <n-card v-else-if="loading" :bordered="false">
      <n-space justify="center">
        <n-spin size="medium" />
        <n-text>加载角色信息中...</n-text>
      </n-space>
    </n-card>

    <!-- 空状态 -->
    <n-empty v-else description="未选择角色" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { rolesApi } from '@/api/roles'
import type { Role } from '@/types/api'

interface Props {
  roleName?: string
  role?: Role | null
}

interface Emits {
  (e: 'use-role', role: Role): void
  (e: 'copy-prompt', prompt: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const message = useMessage()

// 响应式数据
const loading = ref(false)
const role = ref<Role | null>(props.role || null)

// 方法
const loadRole = async (roleName: string) => {
  if (!roleName) {
    role.value = null
    return
  }

  loading.value = true
  try {
    console.log('🎭 加载角色详情:', roleName)
    const roleData = await rolesApi.getRole(roleName)
    role.value = roleData
    
    console.log('✅ 角色详情加载成功:', roleData.displayName)
  } catch (error: any) {
    console.error('❌ 加载角色详情失败:', error)
    message.error(`加载角色详情失败: ${error.message}`)
    role.value = null
  } finally {
    loading.value = false
  }
}

const handleUseRole = () => {
  if (role.value) {
    emit('use-role', role.value)
    message.success(`已选择角色: ${role.value.displayName}`)
  }
}

const handleCopyPrompt = async () => {
  if (!role.value?.prompt) {
    message.warning('没有可复制的提示词')
    return
  }

  try {
    await navigator.clipboard.writeText(role.value.prompt)
    message.success('提示词已复制到剪贴板')
    emit('copy-prompt', role.value.prompt)
  } catch (error) {
    console.error('复制失败:', error)
    message.error('复制失败，请手动复制')
  }
}

// 监听属性变化
watch(
  () => props.roleName,
  (newRoleName) => {
    if (newRoleName && newRoleName !== role.value?.name) {
      loadRole(newRoleName)
    }
  },
  { immediate: true }
)

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      role.value = newRole
    }
  },
  { immediate: true }
)

// 公开方法
const refresh = () => {
  if (props.roleName) {
    loadRole(props.roleName)
  }
}

// 暴露给父组件的方法
defineExpose({
  refresh,
  role,
  loading
})
</script>

<style scoped lang="scss">
.role-detail {
  .role-section {
    .section-title {
      display: flex;
      align-items: center;
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-1);
      
      .section-icon {
        margin-right: 6px;
        color: var(--primary-color);
      }
    }
    
    .role-description {
      line-height: 1.6;
      color: var(--text-color-2);
    }
  }
  
  .role-actions {
    padding-top: 8px;
    border-top: 1px solid var(--border-color);
  }
}
</style>
