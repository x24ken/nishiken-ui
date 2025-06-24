import fs from 'fs/promises'
import path from 'path'
import { ComponentReader } from '../utils/component-reader.js'
import { TailwindTokenReader } from '../utils/tailwind-token-reader.js'

export interface IntegrationOptions {
  targetPath: string
  framework?: 'react' | 'next' | 'vite'
  typescript?: boolean
  setupTailwind?: boolean
  setupStorybook?: boolean
}

export interface ComponentIntegrationRequest {
  components: string[]
  targetPath: string
  options?: IntegrationOptions
}

export interface IntegrationResult {
  success: boolean
  message: string
  files: Array<{
    path: string
    content: string
    action: 'create' | 'update'
  }>
  instructions: string[]
  dependencies: string[]
}

export class IntegrationManager {
  private componentReader: ComponentReader
  private tokenReader: TailwindTokenReader

  constructor(designSystemPath: string) {
    this.componentReader = new ComponentReader(designSystemPath)
    this.tokenReader = new TailwindTokenReader(designSystemPath)
  }

  async applyThemeSetup(options: IntegrationOptions): Promise<IntegrationResult> {
    const files: IntegrationResult['files'] = []
    const instructions: string[] = []
    const dependencies: string[] = []

    try {
      // Tailwind CSS v4設定の生成
      if (options.setupTailwind) {
        const tokens = await this.tokenReader.getDesignTokens()
        const tailwindConfig = await this.tokenReader.getTailwindConfig()

        // globals.css の生成
        const globalCSS = this.generateGlobalCSS(tokens)
        files.push({
          path: 'src/styles/globals.css',
          content: globalCSS,
          action: 'create'
        })

        // tailwind.config.ts の生成
        const configContent = this.generateTailwindConfig(tailwindConfig, options)
        files.push({
          path: 'tailwind.config.ts',
          content: configContent,
          action: 'create'
        })

        dependencies.push('@tailwindcss/vite@4.0.0-beta.7', 'tailwindcss@4.0.0-beta.7')
        instructions.push('npm install @tailwindcss/vite@4.0.0-beta.7 tailwindcss@4.0.0-beta.7')
      }

      // TypeScript設定
      if (options.typescript) {
        const tsConfig = this.generateTSConfig(options.framework)
        files.push({
          path: 'tsconfig.json',
          content: JSON.stringify(tsConfig, null, 2),
          action: 'create'
        })
      }

      // フレームワーク固有の設定
      switch (options.framework) {
        case 'vite':
          const viteConfig = this.generateViteConfig(options)
          files.push({
            path: 'vite.config.ts',
            content: viteConfig,
            action: 'create'
          })
          dependencies.push('@vitejs/plugin-react', 'vite')
          break

        case 'next':
          const nextConfig = this.generateNextConfig(options)
          files.push({
            path: 'next.config.js',
            content: nextConfig,
            action: 'create'
          })
          dependencies.push('next', 'react', 'react-dom')
          break
      }

      // ユーティリティ関数
      const utilsContent = await this.generateUtilsFile()
      files.push({
        path: 'src/lib/utils.ts',
        content: utilsContent,
        action: 'create'
      })

      dependencies.push('clsx', 'tailwind-merge', 'class-variance-authority')

      instructions.push(
        '1. 依存関係をインストール',
        '2. globals.css をメインCSSファイルとしてインポート',
        '3. Tailwind CSS v4のViteプラグインを設定',
        '4. Dark modeサポートには .dark クラスを使用'
      )

      return {
        success: true,
        message: 'テーマ設定が正常に生成されました',
        files,
        instructions,
        dependencies
      }

    } catch (error) {
      return {
        success: false,
        message: `テーマ設定の生成に失敗しました: ${error}`,
        files: [],
        instructions: [],
        dependencies: []
      }
    }
  }

  async integrateComponents(request: ComponentIntegrationRequest): Promise<IntegrationResult> {
    const files: IntegrationResult['files'] = []
    const instructions: string[] = []
    const allDependencies = new Set<string>()

    try {
      // 各コンポーネントの処理
      for (const componentName of request.components) {
        const componentInfo = await this.componentReader.getComponentInfo(componentName)
        const componentCode = await this.componentReader.getComponentCode(componentName, {
          includeIndex: true,
          includeStories: request.options?.setupStorybook
        })

        // コンポーネントファイルの生成
        const componentDir = `src/components/${componentName.toLowerCase()}`
        
        files.push({
          path: `${componentDir}/${componentName.toLowerCase()}.tsx`,
          content: componentCode.tsx,
          action: 'create'
        })

        if (componentCode.index) {
          files.push({
            path: `${componentDir}/index.ts`,
            content: componentCode.index,
            action: 'create'
          })
        }

        // Storybookストーリー
        if (componentCode.stories && request.options?.setupStorybook) {
          files.push({
            path: `${componentDir}/${componentName.toLowerCase()}.stories.tsx`,
            content: componentCode.stories,
            action: 'create'
          })
        }

        // 依存関係の収集
        componentInfo.dependencies.forEach(dep => allDependencies.add(dep))
      }

      // メインインデックスファイルの生成
      const indexContent = this.generateMainIndexFile(request.components)
      files.push({
        path: 'src/components/index.ts',
        content: indexContent,
        action: 'create'
      })

      // 必要な依存関係
      allDependencies.add('@radix-ui/react-slot')
      allDependencies.add('class-variance-authority')
      allDependencies.add('clsx')
      allDependencies.add('tailwind-merge')

      if (request.options?.setupStorybook) {
        allDependencies.add('@storybook/react')
        allDependencies.add('storybook')
      }

      const dependencies = Array.from(allDependencies)

      instructions.push(
        `1. 依存関係をインストール: npm install ${dependencies.join(' ')}`,
        '2. globals.css をインポートして Tailwind CSS v4 を適用',
        '3. コンポーネントを import { ComponentName } from "./components" で使用',
        '4. Dark mode は .dark クラスで制御'
      )

      if (request.options?.setupStorybook) {
        instructions.push('5. Storybook を npx storybook init で初期化')
      }

      return {
        success: true,
        message: `${request.components.length}個のコンポーネントが正常に統合されました`,
        files,
        instructions,
        dependencies
      }

    } catch (error) {
      return {
        success: false,
        message: `コンポーネント統合に失敗しました: ${error}`,
        files: [],
        instructions: [],
        dependencies: []
      }
    }
  }

  private generateGlobalCSS(tokens: any): string {
    let css = '@import "tailwindcss";\n\n'
    
    // Light theme
    css += ':root {\n'
    for (const [name, token] of Object.entries(tokens.light)) {
      css += `  --${(token as any).name}: ${(token as any).value};\n`
    }
    css += '}\n\n'

    // Dark theme
    css += '.dark {\n'
    for (const [name, token] of Object.entries(tokens.dark)) {
      css += `  --${(token as any).name}: ${(token as any).value};\n`
    }
    css += '}\n\n'

    // Base styles
    css += `
* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`

    return css
  }

  private generateTailwindConfig(baseConfig: any, options: IntegrationOptions): string {
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    ${options.setupStorybook ? "'./stories/**/*.{ts,tsx}'," : ''}
    ${options.framework === 'next' ? "'./app/**/*.{ts,tsx}'," : ''}
    ${options.framework === 'next' ? "'./pages/**/*.{ts,tsx}'," : ''}
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config`
  }

  private generateViteConfig(options: IntegrationOptions): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})`
  }

  private generateNextConfig(options: IntegrationOptions): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-slot'],
  },
}

module.exports = nextConfig`
  }

  private generateTSConfig(framework?: string): any {
    const baseConfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src"],
      references: []
    }

    if (framework === 'next') {
      baseConfig.compilerOptions.lib.push('DOM.Iterable')
      baseConfig.include.push('next-env.d.ts', '**/*.ts', '**/*.tsx')
    }

    return baseConfig
  }

  private async generateUtilsFile(): Promise<string> {
    return `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
  }

  private generateMainIndexFile(components: string[]): string {
    const exports = components.map(name => 
      `export * from './${name.toLowerCase()}'`
    ).join('\n')

    return `// Auto-generated exports for nishiken-ui components
${exports}
export * from '../lib/utils'`
  }
}