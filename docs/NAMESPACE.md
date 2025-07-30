## 🤔 关于Namespace功能的问题

### 核心功能范围
- 创建、删除、切换、列表显示
- 编辑namespace信息
- 查看namespace详细信息（如包含的agents数量、创建时间等）

### 数据关联
- 当切换namespace时需要联动更新 agent列表，socket 连接的对象？
- 需要显示每个namespace下有多少个agents
- 删除namespace时，默认会报错，要带上--foce的功能强制删除

### 4. 用户体验
- 默认namespac: default
- 需要记住用户上次选择的namespace
- 切换namespace时是否需要loading状态