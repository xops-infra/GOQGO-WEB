<template>
  <div class="role-selector">
    <n-select
      v-model:value="selectedRole"
      :options="roleOptions"
      :loading="loading"
      :placeholder="placeholder"
      :clearable="clearable"
      :filterable="filterable"
      :render-label="renderLabel"
      :render-option="renderOption"
      @update:value="handleRoleChange"
      @focus="handleFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { NSelect, NText, NSpace, NIcon, useMessage } from 'naive-ui'
import { UserIcon } from '@heroicons/vue/24/outline'
import { rolesApi } from '@/api/roles'
import type { Role } from '@/types/api'

interface Props {
  modelValue?: string
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'change', role: Role | null): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择角色',
  clearable: true,
  filterable: true,
  disabled: false
})

const emit = defineEmits<Emits>()
const message = useMessage()

// 响应式数据
const loading = ref(false)
const roles = ref<Role[]>([])
const selectedRole = ref<string | null>(props.modelValue || null)

// 计算属性
const roleOptions = computed(() => {
  return roles.value.map(role => ({
    label: role.displayName,
    value: role.name,
    role: role
  }))
})

// 渲染标签
const renderLabel = (option: any) => {
  return h(NSpace, { align: 'center' }, {
    default: () => [
      h(NIcon, { size: 16 }, {
        default: () => h(UserIcon)
      }),
      h(NText, null, { default: () => option.label })
    ]
  })
}

// 渲染选项
const renderOption = ({ node, option }: any) => {
  const role = option.role as Role
  return h('div', { class: 'role-option' }, [
    h('div', { class: 'role-option-header' }, [
      h(NSpace, { align: 'center' }, {
        default: () => [
          h(NIcon, { size: 16 }, {
            default: () => h(UserIcon)
          }),
          h(NText, { strong: true }, { default: () => role.displayName }),
          h(NText, { depth: 3, size: 'small' }, { default: () => `(${role.name})` })
        ]
      })
    ]),
    h('div', { class: 'role-option-description' }, [
      h(NText, { depth: 2, size: 'small' }, { 
        default: () => role.description.length > 50 
          ? `${role.description.substring(0, 50)}...` 
          : role.description 
      })
    ])
  ])
}

// 方法
const loadRoles = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    console.log('🎭 加载角色列表...')
    const response = await rolesApi.getList()
    roles.value = response.roles || []
    
    console.log('✅ 角色列表加载成功:', {
      total: response.total,
      loaded: roles.value.length
    })
  } catch (error: any) {
    console.error('❌ 加载角色列表失败:', error)
    message.error(`加载角色列表失败: ${error.message}`)
    roles.value = []
  } finally {
    loading.value = false
  }
}

const handleRoleChange = (value: string | null) => {
  selectedRole.value = value
  emit('update:modelValue', value)
  
  // 查找对应的角色对象
  const role = roles.value.find(r => r.name === value) || null
  emit('change', role)
  
  if (role) {
    console.log('🎭 角色已选择:', {
      name: role.name,
      displayName: role.displayName
    })
  }
}

const handleFocus = () => {
  // 如果还没有加载角色，则在聚焦时加载
  if (roles.value.length === 0 && !loading.value) {
    loadRoles()
  }
}

// 公开方法
const refresh = () => {
  loadRoles()
}

const getRoleByName = (roleName: string): Role | null => {
  return roles.value.find(role => role.name === roleName) || null
}

// 生命周期
onMounted(() => {
  loadRoles()
})

// 暴露给父组件的方法
defineExpose({
  refresh,
  getRoleByName,
  roles: computed(() => roles.value),
  loading: computed(() => loading.value)
})
</script>

<style scoped lang="scss">
.role-selector {
  width: 100%;
}

:deep(.role-option) {
  padding: 8px 0;
  
  .role-option-header {
    margin-bottom: 4px;
  }
  
  .role-option-description {
    padding-left: 24px;
    line-height: 1.4;
  }
}
</style>
