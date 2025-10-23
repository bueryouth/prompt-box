# Prompt Box

A lightweight tool project for managing and displaying prompt messages, suitable for scenarios requiring message prompts in web pages.

## Features

- Supports customizing prompt box styles
- Provides various prompt box display animations
- Supports customizing prompt box position
- Offers a simple API interface

## Installation

You can install directly via npm:

```bash
npm install prompt-box
```

Or via yarn:

```bash
yarn add prompt-box
```

## Usage Example

```javascript
import PromptBox from 'prompt-box';

// Display a prompt message
PromptBox.show('This is a prompt message');

// Display a styled prompt message
PromptBox.show('This is a styled prompt message', {
  className: 'custom-style',
  duration: 3000,
  position: 'top-right'
});
```

## API

### `PromptBox.show(message: string, options?: PromptBoxOptions)`

Displays a prompt message.

#### Parameters

- `message`: The content of the prompt message to display.
- `options` (optional): Configuration options for the prompt box, which may include the following properties:
  - `className`: Custom CSS class name
  - `duration`: Duration (in milliseconds) for which the prompt box is displayed
  - `position`: Position where the prompt box appears

## Contribution

Contributions are welcome! If you find any issues or have suggestions for improvements, please submit an issue or pull request.

## License

MIT License. See the [LICENSE](./LICENSE) file for details.