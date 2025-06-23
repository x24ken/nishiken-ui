# Nishiken UI

[![npm version](https://img.shields.io/npm/v/nishiken-ui.svg)](https://www.npmjs.com/package/nishiken-ui)
[![npm downloads](https://img.shields.io/npm/dm/nishiken-ui.svg)](https://www.npmjs.com/package/nishiken-ui)
[![license](https://img.shields.io/npm/l/nishiken-ui.svg)](https://github.com/x24ken/nishiken-ui/blob/main/LICENSE)

A modern React component library built with TypeScript and Tailwind CSS v4 (beta). Beautiful, accessible, and customizable UI components for your next project.

## 📦 Installation

```bash
npm install nishiken-ui
```

or

```bash
yarn add nishiken-ui
```

or

```bash
pnpm add nishiken-ui
```

## 🚀 Quick Start

1. Import the CSS file in your app's entry point:

```typescript
// main.tsx or App.tsx
import 'nishiken-ui/styles.css'
```

2. Start using components:

```typescript
import { Button, Card, Input } from 'nishiken-ui'

function App() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Welcome to Nishiken UI</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input placeholder="Enter your name" />
        <Button variant="primary">Get Started</Button>
      </Card.Content>
    </Card>
  )
}
```

## ✨ Features

- 🎨 **Modern Design** - Clean and modern design system with Tailwind CSS v4
- 🌗 **Dark Mode** - Built-in dark mode support with CSS variables
- 📱 **Responsive** - Mobile-first responsive design
- ♿ **Accessible** - WAI-ARIA compliant components
- 🎯 **TypeScript** - Full TypeScript support with exported types
- 🎪 **Customizable** - Easy to customize with Tailwind utilities
- 🚀 **Tree Shakeable** - ESM modules for optimal bundle size
- 📚 **Well Documented** - Comprehensive Storybook documentation

## 🧩 Available Components

### Current Components (v0.0.1)
- **Button** - Primary, secondary, destructive, outline, ghost, and link variants
- **Card** - Flexible card component with header, content, and footer sections
- **Input** - Form input with label support
- **Label** - Accessible form labels
- **Typography** - Heading and Text components with semantic HTML

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- ✅ Project setup with Vite, TypeScript, and Tailwind CSS v4
- ✅ Button component with variants
- ✅ Typography system (Heading, Text)
- ✅ Card component with compound pattern
- ✅ Input and Label components
- ✅ Design tokens and color system
- ✅ NPM package publication

### Phase 2: Core Components 🚧
- 📋 Form components (Select, Checkbox, Radio, Switch)
- 📊 Data display (Table, List, Badge)
- 💬 Feedback components (Alert, Toast, Progress)
- 🎨 Layout components (Container, Grid, Stack)

### Phase 3: Advanced Components 📅
- 🎯 Navigation (Tabs, Breadcrumb, Pagination, Menu)
- 🪟 Overlay components (Modal, Popover, Tooltip, Drawer)
- 📅 Date/Time pickers
- 🎨 Advanced theming system

### Phase 4: Polish & Ecosystem 🌟
- ♿ Enhanced accessibility
- ⚡ Performance optimization
- 📖 Comprehensive documentation site
- 🎨 Theme builder tool
- 🧪 Testing utilities

## 💻 Development

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/x24ken/nishiken-ui.git
cd nishiken-ui

# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook for component development
npm run storybook
```

### Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build the library
npm run build:watch  # Build in watch mode
npm run storybook    # Start Storybook
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS v4](https://tailwindcss.com/)
- Component patterns inspired by [Radix UI](https://www.radix-ui.com/)
- Variant system powered by [CVA](https://cva.style/)

## 📧 Contact

- NPM: [https://www.npmjs.com/package/nishiken-ui](https://www.npmjs.com/package/nishiken-ui)
- GitHub: [https://github.com/x24ken/nishiken-ui](https://github.com/x24ken/nishiken-ui)

---

Made with ❤️ by nishiken