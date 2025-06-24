#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ComponentReader } from './utils/component-reader.js'
import { TailwindTokenReader } from './utils/tailwind-token-reader.js'
import { IntegrationManager } from './tools/integration-tools.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// デザインシステムのベースパス
const DESIGN_SYSTEM_PATH = path.resolve(__dirname, '../../src')

class NishikenUIServer {
  private server: Server
  private componentReader: ComponentReader
  private tokenReader: TailwindTokenReader
  private integrationManager: IntegrationManager

  constructor() {
    this.componentReader = new ComponentReader(DESIGN_SYSTEM_PATH)
    this.tokenReader = new TailwindTokenReader(DESIGN_SYSTEM_PATH)
    this.integrationManager = new IntegrationManager(DESIGN_SYSTEM_PATH)
    
    this.server = new Server(
      {
        name: 'nishiken-ui-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // ツール一覧
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_components',
            description: 'nishiken-ui デザインシステムからコンポーネントを検索',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '検索キーワード',
                },
                category: {
                  type: 'string',
                  description: 'コンポーネントカテゴリ',
                  enum: ['button', 'input', 'card', 'typography', 'label'],
                },
              },
            },
          },
          {
            name: 'get_component_code',
            description: 'コンポーネントのコードを取得',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: {
                  type: 'string',
                  description: 'コンポーネント名',
                },
                includeStories: {
                  type: 'boolean',
                  description: 'Storybookのストーリーを含めるか',
                  default: false,
                },
                includeTypes: {
                  type: 'boolean',
                  description: '型定義ファイルを含めるか',
                  default: false,
                },
                includeIndex: {
                  type: 'boolean',
                  description: 'index.tsファイルを含めるか',
                  default: true,
                },
              },
              required: ['componentName'],
            },
          },
          {
            name: 'get_design_tokens',
            description: 'デザイントークンを取得',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'トークンカテゴリ',
                  enum: ['color', 'spacing', 'border-radius', 'typography', 'shadow', 'animation'],
                },
                format: {
                  type: 'string',
                  description: '出力形式',
                  enum: ['json', 'css', 'js'],
                  default: 'json',
                },
              },
            },
          },
          {
            name: 'apply_theme_setup',
            description: 'プロジェクトにテーマ設定を適用',
            inputSchema: {
              type: 'object',
              properties: {
                targetPath: {
                  type: 'string',
                  description: '対象プロジェクトのパス',
                },
                framework: {
                  type: 'string',
                  description: 'フレームワーク',
                  enum: ['react', 'next', 'vite'],
                  default: 'vite',
                },
                typescript: {
                  type: 'boolean',
                  description: 'TypeScript使用',
                  default: true,
                },
                setupTailwind: {
                  type: 'boolean',
                  description: 'Tailwind CSS v4をセットアップ',
                  default: true,
                },
              },
              required: ['targetPath'],
            },
          },
          {
            name: 'integrate_components',
            description: 'コンポーネントをプロジェクトに統合',
            inputSchema: {
              type: 'object',
              properties: {
                components: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '統合するコンポーネント名の配列',
                },
                targetPath: {
                  type: 'string',
                  description: '対象プロジェクトのパス',
                },
                framework: {
                  type: 'string',
                  description: 'フレームワーク',
                  enum: ['react', 'next', 'vite'],
                  default: 'vite',
                },
                setupStorybook: {
                  type: 'boolean',
                  description: 'Storybookストーリーを含める',
                  default: false,
                },
              },
              required: ['components', 'targetPath'],
            },
          },
        ],
      }
    })

    // リソース一覧
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'nishiken-ui://components/catalog',
            mimeType: 'application/json',
            name: 'Component Catalog',
            description: 'nishiken-ui デザインシステムの全コンポーネント一覧',
          },
          {
            uri: 'nishiken-ui://design-tokens/colors',
            mimeType: 'application/json',
            name: 'Design Tokens - Colors',
            description: 'カラートークンの定義',
          },
        ],
      }
    })

    // ツール実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'search_components':
          return await this.searchComponents(args as any)
        case 'get_component_code':
          return await this.getComponentCode(args as any)
        case 'get_design_tokens':
          return await this.getDesignTokens(args as any)
        case 'apply_theme_setup':
          return await this.applyThemeSetup(args as any)
        case 'integrate_components':
          return await this.integrateComponents(args as any)
        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    })

    // リソース読み取り
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params

      if (uri === 'nishiken-ui://components/catalog') {
        return await this.getComponentCatalog()
      } else if (uri === 'nishiken-ui://design-tokens/colors') {
        return await this.getDesignTokens({ category: 'color' })
      }

      throw new Error(`Unknown resource: ${uri}`)
    })
  }

  private async searchComponents(args: { query?: string; category?: string }) {
    try {
      const results = await this.componentReader.searchComponents(
        args.query || '', 
        args.category
      )

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              results: results.map(info => ({
                name: info.name,
                path: info.path,
                description: info.description,
                variants: info.variants,
                hasStories: info.hasStories,
                dependencies: info.dependencies,
                props: info.props
              })),
              total: results.length,
              query: args.query,
              category: args.category,
            }, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`コンポーネント検索に失敗しました: ${error}`)
    }
  }

  private async getComponentCode(args: { 
    componentName: string; 
    includeStories?: boolean;
    includeTypes?: boolean;
    includeIndex?: boolean;
  }) {
    try {
      const componentCode = await this.componentReader.getComponentCode(
        args.componentName,
        {
          includeStories: args.includeStories,
          includeTypes: args.includeTypes,
          includeIndex: args.includeIndex
        }
      )

      const componentInfo = await this.componentReader.getComponentInfo(args.componentName)
      
      const results = {
        componentName: args.componentName,
        info: {
          description: componentInfo.description,
          variants: componentInfo.variants,
          dependencies: componentInfo.dependencies,
          props: componentInfo.props
        },
        files: {
          [`${args.componentName}.tsx`]: componentCode.tsx,
          ...(componentCode.index && { 'index.ts': componentCode.index }),
          ...(componentCode.stories && { [`${args.componentName}.stories.tsx`]: componentCode.stories }),
          ...(componentCode.types && { [`${args.componentName}.types.ts`]: componentCode.types })
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`コンポーネントコード取得に失敗しました: ${error}`)
    }
  }

  private async getDesignTokens(args: { category?: string; format?: string }) {
    try {
      const format = args.format || 'json'
      const tokens = await this.tokenReader.getDesignTokens(args.category)

      let result: any = tokens

      if (format === 'css') {
        result = this.formatTokensAsCSS(tokens)
      } else if (format === 'js') {
        result = this.formatTokensAsJS(tokens)
      }

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`デザイントークン取得に失敗しました: ${error}`)
    }
  }

  private formatTokensAsCSS(tokens: any): string {
    let css = ':root {\n'
    for (const [name, token] of Object.entries(tokens.light)) {
      css += `  --${(token as any).name}: ${(token as any).value};\n`
    }
    css += '}\n\n.dark {\n'
    for (const [name, token] of Object.entries(tokens.dark)) {
      css += `  --${(token as any).name}: ${(token as any).value};\n`
    }
    css += '}\n'
    return css
  }

  private formatTokensAsJS(tokens: any): string {
    return `export const designTokens = ${JSON.stringify(tokens, null, 2)};`
  }

  private async applyThemeSetup(args: {
    targetPath: string;
    framework?: string;
    typescript?: boolean;
    setupTailwind?: boolean;
  }) {
    try {
      const result = await this.integrationManager.applyThemeSetup({
        targetPath: args.targetPath,
        framework: args.framework as any,
        typescript: args.typescript,
        setupTailwind: args.setupTailwind
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`テーマ設定適用に失敗しました: ${error}`)
    }
  }

  private async integrateComponents(args: {
    components: string[];
    targetPath: string;
    framework?: string;
    setupStorybook?: boolean;
  }) {
    try {
      const result = await this.integrationManager.integrateComponents({
        components: args.components,
        targetPath: args.targetPath,
        options: {
          targetPath: args.targetPath,
          framework: args.framework as any,
          setupStorybook: args.setupStorybook
        }
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`コンポーネント統合に失敗しました: ${error}`)
    }
  }

  private async getComponentCatalog() {
    try {
      const componentNames = await this.componentReader.getComponentList()
      const catalog = await Promise.all(
        componentNames.map(async (name) => {
          try {
            const info = await this.componentReader.getComponentInfo(name)
            return {
              name: info.name,
              path: info.path,
              description: info.description,
              variants: info.variants,
              hasStories: info.hasStories,
              hasTypes: info.hasTypes,
              dependencies: info.dependencies,
              props: info.props.map(prop => ({
                name: prop.name,
                type: prop.type,
                required: prop.required,
                description: prop.description
              }))
            }
          } catch (error) {
            return null
          }
        })
      )

      return {
        contents: [
          {
            type: 'text',
            text: JSON.stringify({
              components: catalog.filter(Boolean),
              total: catalog.filter(Boolean).length,
              generatedAt: new Date().toISOString(),
            }, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`コンポーネントカタログ取得に失敗しました: ${error}`)
    }
  }


  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

// サーバー起動
const server = new NishikenUIServer()
server.run().catch(console.error)