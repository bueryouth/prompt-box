# Prompt Box

这是一个用于管理和展示提示信息的轻量级工具项目，适用于需要在网页中展示提示内容的场景。

## 功能特性

- 支持自定义提示框样式
- 提供多种提示框展示动画
- 支持自定义提示框位置
- 提供简洁的 API 接口

## 安装

您可以直接通过 npm 安装：

```bash
npm install prompt-box
```

或者通过 yarn 安装：

```bash
yarn add prompt-box
```

## 使用示例

```javascript
import PromptBox from 'prompt-box';

// 显示提示信息
PromptBox.show('这是一个提示信息');

// 显示带样式的提示信息
PromptBox.show('这是一个带样式的提示信息', {
  className: 'custom-style',
  duration: 3000,
  position: 'top-right'
});
```

## API

### `PromptBox.show(message: string, options?: PromptBoxOptions)`

显示一个提示信息。

#### 参数

- `message`：要显示的提示信息内容。
- `options`（可选）：提示框的配置选项，可包含以下属性：
  - `className`：自定义样式类名
  - `duration`：提示框显示的持续时间（毫秒）
  - `position`：提示框显示的位置

## 贡献

欢迎贡献代码和改进！如果您发现任何问题或有改进建议，请提交 issue 或 pull request。

## 许可证

MIT License，详情请查看 [LICENSE](./LICENSE) 文件。