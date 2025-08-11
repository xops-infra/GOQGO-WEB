<template>
  <div class="icon-test-page">
    <h1>终端图标测试</h1>
    
    <div class="icon-section">
      <h2>新的终端图标设计</h2>
      <div class="icon-display">
        <TerminalIcons 
          name="terminal" 
          :size="64" 
          color="#00ff41" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <p>64x64 尺寸</p>
      </div>
      
      <div class="icon-display">
        <TerminalIcons 
          name="terminal" 
          :size="48" 
          color="#00ff41" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <p>48x48 尺寸</p>
      </div>
      
      <div class="icon-display">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#00ff41" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <p>32x32 尺寸 (Header中使用)</p>
      </div>
      
      <div class="icon-display">
        <TerminalIcons 
          name="terminal" 
          :size="24" 
          color="#00ff41" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <p>24x24 尺寸</p>
      </div>
    </div>
    
    <div class="icon-section">
      <h2>不同颜色测试</h2>
      <div class="color-test">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#00ff41" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <span>#00ff41 (绿色)</span>
      </div>
      
      <div class="color-test">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#00ffff" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <span>#00ffff (青色)</span>
      </div>
      
      <div class="color-test">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#ff00ff" 
          :glow="true" 
          :animated="false"
          class="test-icon"
        />
        <span>#ff00ff (洋红)</span>
      </div>
    </div>
    
    <div class="icon-section">
      <h2>动画效果测试</h2>
      <div class="animation-test">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#00ff41" 
          :glow="true" 
          :animated="true"
          class="test-icon"
        />
        <span>启用动画</span>
      </div>
      
      <div class="animation-test">
        <TerminalIcons 
          name="terminal" 
          :size="32" 
          color="#00ff41" 
          :glow="false" 
          :animated="false"
          class="test-icon"
        />
        <span>无发光效果</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TerminalIcons from '@/components/TerminalIcons.vue'
</script>

<style scoped lang="scss">
.icon-test-page {
  padding: 40px;
  background: #0a0a0a;
  min-height: 100vh;
  color: #ffffff;
  
  h1 {
    color: white;
    text-align: center;
    margin-bottom: 40px;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 10px #00ff41, 0 0 15px #00ff41, 0 0 20px #00ff41;
    background: rgba(0, 255, 65, 0.1);
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid rgba(0, 255, 65, 0.3);
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
    display: inline-block;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  
  h2 {
    color: white;
    margin-bottom: 20px;
    font-family: 'Courier New', monospace;
    background: rgba(0, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
    display: inline-block;
    text-shadow: 0 0 6px #00ffff, 0 0 10px #00ffff;
  }
}

.icon-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
}

.icon-display {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #1a1a1a;
  border-radius: 6px;
  
  p {
    margin: 0;
    color: white;
    font-family: 'Courier New', monospace;
    background: rgba(0, 255, 65, 0.1);
    padding: 4px 8px;
    border-radius: 3px;
    border: 1px solid rgba(0, 255, 65, 0.3);
    box-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
    text-shadow: 0 0 4px #00ff41, 0 0 6px #00ff41;
  }
}

.color-test {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 15px;
  background: #1a1a1a;
  border-radius: 6px;
  
  span {
    color: white;
    font-family: 'Courier New', monospace;
    background: rgba(0, 255, 65, 0.1);
    padding: 4px 8px;
    border-radius: 3px;
    border: 1px solid rgba(0, 255, 65, 0.3);
    box-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
    text-shadow: 0 0 4px #00ff41, 0 0 6px #00ff41;
  }
}

.animation-test {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 15px;
  background: #1a1a1a;
  border-radius: 6px;
  
  span {
    color: #ccc;
    font-family: 'Courier New', monospace;
  }
}

.test-icon {
  filter: drop-shadow(0 0 8px currentColor);
  
  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 12px currentColor);
  }
}
</style>
