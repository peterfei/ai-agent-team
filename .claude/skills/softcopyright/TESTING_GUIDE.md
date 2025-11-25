# SoftCopyright 测试指南

## 🧪 完整测试流程

### 1. 环境准备测试

```bash
# 1.1 检查 Node.js 环境
node --version  # 应该显示 >= 14.0.0
npm --version   # 应该显示 >= 6.0.0

# 1.2 进入项目目录
cd ~/.claude/skills/softcopyright

# 1.3 检查文件结构
ls -la
# 应该看到以下文件：
# - scripts/
# - templates/
# - package.json
# - README.md
# - SKILL.md
# - install.sh

# 1.4 检查依赖安装
npm list --depth=0
# 应该看到已安装的依赖包列表
```

### 2. 基础功能测试

#### 2.1 项目扫描测试

```bash
# 测试扫描当前项目
node scripts/index.js scan .

# 测试扫描其他项目（如果有的话）
node scripts/index.js scan /path/to/other/project

# 预期输出示例：
# 🔍 扫描项目: /path/to/project
# 📊 分析源代码文件...
# ✅ 扫描完成: X 个文件, Y 行代码
#
# 📊 扫描结果:
# 项目名称: project-name
# 源代码文件: X 个
# 总代码行数: Y 行
# 主要语言: language1, language2
#
# 📁 文件类型统计:
#   .js: X 个文件
#   .py: Y 个文件
```

#### 2.2 命令行帮助测试

```bash
# 测试主帮助
node scripts/index.js --help

# 测试生成命令帮助
node scripts/index.js generate --help

# 测试扫描命令帮助
node scripts/index.js scan --help

# 预期输出：显示帮助信息和使用说明
```

### 3. 交互式功能测试

#### 3.1 交互式向导测试

```bash
# 启动交互式向导
node scripts/index.js interactive

# 测试流程：
# 1. 会询问项目路径（默认当前目录）
# 2. 显示项目分析结果
# 3. 询问是否确认信息
# 4. 选择生成类型（全部/说明书/源代码）
# 5. 指定输出目录
# 6. 开始生成并显示进度
```

### 4. 文档生成测试

#### 4.1 生成软件说明书测试

```bash
# 创建测试输出目录
mkdir -p ~/Desktop/softcopyright-test

# 仅生成软件说明书
node scripts/index.js generate \
  --type manual \
  --output ~/Desktop/softcopyright-test

# 检查生成结果
ls ~/Desktop/softcopyright-test/
# 应该看到：软件说明书_softcopyright_YYYYMMDD_HHMMSS.pdf
```

#### 4.2 生成源代码文档测试

```bash
# 仅生成源代码文档
node scripts/index.js generate \
  --type source \
  --output ~/Desktop/softcopyright-test

# 检查生成结果
ls ~/Desktop/softcopyright-test/
# 应该看到：源代码文档_softcopyright_YYYYMMDD_HHMMSS.pdf
```

#### 4.3 生成完整材料测试

```bash
# 生成完整软著材料
node scripts/index.js generate \
  --type all \
  --output ~/Desktop/softcopyright-test

# 检查生成结果
ls ~/Desktop/softcopyright-test/
# 应该看到两个PDF文件：
# - 软件说明书_softcopyright_YYYYMMDD_HHMMSS.pdf
# - 源代码文档_softcopyright_YYYYMMDD_HHMMSS.pdf
```

### 5. 项目类型测试

#### 5.1 创建不同类型测试项目

```bash
# 创建测试目录
mkdir -p ~/Desktop/test-projects

# 5.1.1 JavaScript项目
mkdir -p ~/Desktop/test-projects/js-app
cat > ~/Desktop/test-projects/js-app/app.js << 'EOF'
// 主应用文件
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

cat > ~/Desktop/test-projects/js-app/package.json << 'EOF'
{
  "name": "test-js-app",
  "version": "1.0.0",
  "description": "Test JavaScript Application",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# 5.1.2 Python项目
mkdir -p ~/Desktop/test-projects/py-app
cat > ~/Desktop/test-projects/py-app/main.py << 'EOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
主应用模块
提供Web服务功能
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    """主页处理函数"""
    return jsonify({"message": "Hello from Python!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
EOF

cat > ~/Desktop/test-projects/py-app/requirements.txt << 'EOF'
Flask==2.0.1
Werkzeug==2.0.1
EOF

# 5.1.3 Java项目
mkdir -p ~/Desktop/test-projects/java-app/src/main/java/com/example
cat > ~/Desktop/test-projects/java-app/src/main/java/com/example/App.java << 'EOF'
package com.example;

import java.util.HashMap;
import java.util.Map;

/**
 * 主应用类
 */
public class App {
    private static Map<String, String> config = new HashMap<>();

    static {
        config.put("app.name", "Test Java App");
        config.put("app.version", "1.0.0");
    }

    public static void main(String[] args) {
        System.out.println("Starting " + config.get("app.name"));
        System.out.println("Version: " + config.get("app.version"));
    }

    public String getConfig(String key) {
        return config.get(key);
    }
}
EOF
```

#### 5.2 测试不同项目类型

```bash
# 测试JavaScript项目
node scripts/index.js scan ~/Desktop/test-projects/js-app
node scripts/index.js generate --path ~/Desktop/test-projects/js-app --output ~/Desktop/softcopyright-test

# 测试Python项目
node scripts/index.js scan ~/Desktop/test-projects/py-app
node scripts/index.js generate --path ~/Desktop/test-projects/py-app --output ~/Desktop/softcopyright-test

# 测试Java项目
node scripts/index.js scan ~/Desktop/test-projects/java-app
node scripts/index.js generate --path ~/Desktop/test-projects/java-app --output ~/Desktop/softcopyright-test
```

### 6. 边界情况测试

#### 6.1 空项目测试

```bash
# 创建空项目
mkdir -p ~/Desktop/test-projects/empty

# 测试空项目扫描（应该报错）
node scripts/index.js scan ~/Desktop/test-projects/empty
# 预期：提示"目录中未检测到源代码文件"
```

#### 6.2 不存在的路径测试

```bash
# 测试不存在的路径
node scripts/index.js scan /nonexistent/path
# 预期：提示"路径不存在"
```

#### 6.3 大文件测试

```bash
# 创建大文件项目
mkdir -p ~/Desktop/test-projects/large

# 生成包含大量代码的文件
for i in {1..100}; do
  cat >> ~/Desktop/test-projects/large/large-file.js << EOF
// Function $i
function function$i() {
    const data = {
        id: $i,
        name: "Test Function $i",
        description: "This is a test function with index $i",
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };

    if (data.id > 0) {
        console.log("Processing function $i");
        for (let j = 0; j < 10; j++) {
            data.items = data.items || [];
            data.items.push({
                itemId: j,
                value: Math.random() * 100,
                timestamp: Date.now()
            });
        }
    }

    return data;
}

EOF
done

# 测试大文件处理
node scripts/index.js scan ~/Desktop/test-projects/large
node scripts/index.js generate --path ~/Desktop/test-projects/large --output ~/Desktop/softcopyright-test
```

### 7. Claude Skill 集成测试

#### 7.1 技能调用测试

```bash
# 方法1: 使用 Skill 命令（如果集成到 Claude）
/agent backend_dev "帮我使用 softcopyright skill 生成软著申请材料"

# 方法2: 直接调用技能
skill: "softcopyright"
# 然后输入：帮我生成当前项目的软著申请材料
```

#### 7.2 搜索功能测试

```bash
# 测试关键词搜索功能
echo "React 电商系统" | node scripts/index.js interactive
# 在交互式向导中测试关键词搜索功能
```

### 8. 输出文件验证

#### 8.1 PDF文件检查

```bash
# 检查生成的PDF文件
ls -la ~/Desktop/softcopyright-test/*.pdf

# 检查文件大小（应该合理）
du -h ~/Desktop/softcopyright-test/*.pdf

# 在macOS上打开PDF文件预览
open ~/Desktop/softcopyright-test/*.pdf
```

#### 8.2 内容验证

检查生成的PDF文件应包含：

**软件说明书PDF：**
- 封面页（项目名称、版本、生成日期）
- 目录页
- 7个主要章节（引言、软件概述、运行环境、设计思想、功能模块、用户指南、测试维护）
- 2000-3000字内容
- 专业排版和格式

**源代码文档PDF：**
- 封面页（项目信息、统计信息）
- 文件列表页
- 源代码内容（60页，每页50行）
- 清理后的代码（无注释、无版权信息）
- 页眉页脚和页码

### 9. 性能测试

#### 9.1 处理速度测试

```bash
# 记录开始时间
start_time=$(date +%s)

# 处理项目
node scripts/index.js generate --path ~/Desktop/test-projects/large --output ~/Desktop/softcopyright-test

# 记录结束时间
end_time=$(date +%s)

# 计算处理时间
processing_time=$((end_time - start_time))
echo "处理时间: $processing_time 秒"
```

#### 9.2 内存使用测试

```bash
# 监控内存使用
node --max-old-space-size=4096 scripts/index.js generate --path ~/Desktop/test-projects/large --output ~/Desktop/softcopyright-test &
PID=$!

# 监控内存使用（macOS）
ps -p $PID -o pid,ppid,%mem,rss,vsz,comm
```

### 10. 错误处理测试

#### 10.1 权限错误测试

```bash
# 创建只读目录
mkdir -p ~/Desktop/test-projects/readonly
echo "console.log('test');" > ~/Desktop/test-projects/readonly/test.js
chmod 444 ~/Desktop/test-projects/readonly

# 测试只读目录（应该有适当的错误处理）
node scripts/index.js scan ~/Desktop/test-projects/readonly
```

#### 10.2 损坏文件测试

```bash
# 创建包含非法字符的文件
echo $'\x00\x01\x02invalid content' > ~/Desktop/test-projects/corrupt/broken.js

# 测试损坏文件处理
node scripts/index.js scan ~/Desktop/test-projects/corrupt
# 预期：应该跳过损坏文件并给出警告
```

### 11. 测试结果验证清单

完成测试后，请验证以下功能：

- [ ] 环境检查通过
- [ ] 项目扫描功能正常
- [ ] 交互式向导工作正常
- [ ] 软件说明书生成成功
- [ ] 源代码文档生成成功
- [ ] 支持多种项目类型
- [ ] 错误处理机制正常
- [ ] PDF文件格式正确
- [ ] 性能表现良好
- [ ] Claude Skill 集成正常

### 12. 常见问题排查

#### 12.1 模块找不到错误

```bash
# 错误：Cannot find module 'xxx'
# 解决：重新安装依赖
npm install
# 或者清理后重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 12.2 PDF生成失败

```bash
# 检查PDF依赖
npm list pdfkit

# 如果有问题，重新安装
npm install pdfkit
```

#### 12.3 权限错误

```bash
# 检查目录权限
ls -la ~/.claude/skills/softcopyright/

# 修复权限（如果需要）
chmod -R 755 ~/.claude/skills/softcopyright/
```

### 13. 测试报告模板

```bash
# 创建测试报告
cat > ~/Desktop/softcopyright-test/report.md << 'EOF'
# SoftCopyright 测试报告

## 测试环境
- 操作系统：$(uname -s)
- Node.js版本：$(node --version)
- 测试时间：$(date)

## 测试结果

### 基础功能测试
- [x] 环境检查
- [x] 项目扫描
- [x] 命令行帮助
- [x] 交互式向导

### 文档生成测试
- [x] 软件说明书生成
- [x] 源代码文档生成
- [x] PDF文件验证

### 项目类型测试
- [x] JavaScript项目
- [x] Python项目
- [x] Java项目

### 边界情况测试
- [x] 空项目处理
- [x] 不存在路径
- [x] 大文件处理

### 性能测试
- 处理速度：[记录时间]
- 内存使用：[记录内存占用]

## 发现的问题
[记录测试中发现的问题]

## 建议改进
[记录改进建议]
EOF
```

---

**测试完成后，请运行：**

```bash
# 清理测试文件
rm -rf ~/Desktop/test-projects ~/Desktop/softcopyright-test

# 或者保留测试结果以便进一步分析
echo "测试文件保留在 ~/Desktop/softcopyright-test"
```

通过以上完整的测试流程，您可以全面验证 SoftCopyright Skill 的所有功能和性能表现。如果遇到任何问题，请参考测试指南中的故障排除部分。