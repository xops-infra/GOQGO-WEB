#!/usr/bin/env node

/**
 * Mock 配置验证脚本
 * 用于验证不同环境下的 Mock 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 Mock 配置验证\n');

// 读取环境配置文件
function readEnvFile(filename) {
  const filePath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const config = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        config[key.trim()] = value.trim();
      }
    }
  });
  
  return config;
}

// 验证配置
function validateConfig(envName, config) {
  console.log(`📋 ${envName} 环境配置:`);
  
  if (!config) {
    console.log('   ❌ 配置文件不存在\n');
    return;
  }
  
  const mockEnabled = config.VITE_MOCK_ENABLED;
  const apiUrl = config.VITE_API_BASE_URL;
  const wsUrl = config.VITE_WS_BASE_URL;
  
  console.log(`   Mock 模式: ${mockEnabled === 'true' ? '✅ 启用' : '❌ 禁用'}`);
  console.log(`   API 地址: ${apiUrl || '未设置'}`);
  console.log(`   WS 地址: ${wsUrl || '未设置'}`);
  
  // 配置建议
  if (envName === '生产环境' && mockEnabled === 'true') {
    console.log('   ⚠️  警告: 生产环境不应启用 Mock 模式');
  }
  
  if (mockEnabled === 'false' && (!apiUrl || !wsUrl)) {
    console.log('   ⚠️  警告: 禁用 Mock 时应配置真实的 API 地址');
  }
  
  console.log('');
}

// 验证所有环境配置
const environments = [
  { name: '开发环境', file: '.env.development' },
  { name: '生产环境', file: '.env.production' },
  { name: '本地覆盖', file: '.env.local' }
];

environments.forEach(env => {
  const config = readEnvFile(env.file);
  validateConfig(env.name, config);
});

// 显示使用说明
console.log('📝 使用说明:');
console.log('   1. 修改对应环境的配置文件');
console.log('   2. 重启开发服务器: npm run dev');
console.log('   3. 检查浏览器控制台的启动日志');
console.log('   4. 使用 window.mockDevTools.getState() 验证状态');
console.log('');

console.log('🔧 快速切换 Mock 模式:');
console.log('   启用: echo "VITE_MOCK_ENABLED=true" >> .env.local');
console.log('   禁用: echo "VITE_MOCK_ENABLED=false" >> .env.local');
console.log('   清除: rm .env.local');
