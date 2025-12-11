# 更新日志

所有关于 "thread-manager" 技能的重要更改都将记录在此文件中。

## [1.1.0] - 2025-12-12

### 新增功能
- **语义搜索**: 增加了使用自然语言查询搜索消息历史的能力，基于意图而非仅基于关键词。
- **新工具**: `search_messages` MCP 工具，允许用户查找相关的历史消息。
- **自动嵌入**: 创建消息时，使用本地 `Xenova/all-MiniLM-L6-v2` 模型自动生成并嵌入（向量化）消息。
- **迁移脚本**: 添加了 `npm run migrate` 脚本，用于为现有消息生成嵌入。
- **数据库更新**: 更新了 SQLite 模式以支持向量存储（`embedding_blob`, `embedding_model`）。

### 变更
- 更新 `Message` 接口，包含可选的 `embedding` 字段。
- `MessagesDAO` 现在处理异步嵌入生成。

## [1.0.0] - 2025-11-20

### 新增功能
- Thread Manager 初始版本发布。
- 核心工具: `create_thread`, `list_threads`, `switch_thread`, `get_thread`, `update_thread`, `delete_thread`.
- 文件追踪: `track_file_change`.
- 消息记录: `add_message`.
- Git 集成: 用于分支管理和文件统计。