import fs from 'fs/promises'
import path from 'path'

export interface DesignToken {
  name: string
  value: string
  category: string
  description?: string
  hsl?: {
    h: number
    s: number
    l: number
  }
}

export interface DesignTokenCollection {
  light: Record<string, DesignToken>
  dark: Record<string, DesignToken>
  categories: string[]
  generatedAt: string
}

export interface TailwindConfig {
  colors: Record<string, any>
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  animation: Record<string, string>
  keyframes: Record<string, any>
}

export class TailwindTokenReader {
  private readonly basePath: string

  constructor(designSystemPath: string) {
    this.basePath = designSystemPath
  }

  async getDesignTokens(category?: string): Promise<DesignTokenCollection> {
    const cssPath = path.join(this.basePath, 'styles', 'globals.css')
    const cssContent = await fs.readFile(cssPath, 'utf-8')

    const lightTokens = this.parseTokens(cssContent, ':root')
    const darkTokens = this.parseTokens(cssContent, '.dark')

    const collection: DesignTokenCollection = {
      light: lightTokens,
      dark: darkTokens,
      categories: this.extractCategories(lightTokens),
      generatedAt: new Date().toISOString()
    }

    if (category) {
      return this.filterByCategory(collection, category)
    }

    return collection
  }

  async getTailwindConfig(): Promise<TailwindConfig> {
    const configPath = path.join(this.basePath, '..', 'tailwind.config.ts')
    
    try {
      // TypeScriptファイルを読み取り、設定を抽出
      const configContent = await fs.readFile(configPath, 'utf-8')
      return this.parseTailwindConfig(configContent)
    } catch (error) {
      throw new Error(`Tailwind設定の読み取りに失敗しました: ${error}`)
    }
  }

  async getColorTokens(): Promise<Record<string, DesignToken[]>> {
    const tokens = await this.getDesignTokens('color')
    
    const colorGroups: Record<string, DesignToken[]> = {}
    
    for (const [mode, modeTokens] of Object.entries(tokens)) {
      if (mode === 'categories' || mode === 'generatedAt') continue
      
      for (const token of Object.values(modeTokens as Record<string, DesignToken>)) {
        if (token.category === 'color') {
          const groupName = this.getColorGroup(token.name)
          if (!colorGroups[groupName]) {
            colorGroups[groupName] = []
          }
          colorGroups[groupName].push(token)
        }
      }
    }

    return colorGroups
  }

  async getSpacingTokens(): Promise<DesignToken[]> {
    const tokens = await this.getDesignTokens('spacing')
    return Object.values(tokens.light).filter(token => token.category === 'spacing')
  }

  private parseTokens(css: string, selector: string): Record<string, DesignToken> {
    const tokens: Record<string, DesignToken> = {}
    
    const regex = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{([^}]+)}`, 's')
    const match = css.match(regex)
    
    if (!match) return tokens

    const content = match[1]
    const variableMatches = content.matchAll(/--([^:]+):\s*([^;]+);/g)

    for (const variableMatch of variableMatches) {
      const [, name, value] = variableMatch
      const tokenName = name.trim()
      const tokenValue = value.trim()

      tokens[tokenName] = {
        name: tokenName,
        value: tokenValue,
        category: this.categorizeToken(tokenName),
        description: this.getTokenDescription(tokenName),
        hsl: this.parseHSL(tokenValue)
      }
    }

    return tokens
  }

  private parseTailwindConfig(content: string): TailwindConfig {
    // 簡易的なTailwind設定パーサー
    const config: TailwindConfig = {
      colors: {},
      spacing: {},
      borderRadius: {},
      animation: {},
      keyframes: {}
    }

    try {
      // colors設定の抽出
      const colorsMatch = content.match(/colors:\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      if (colorsMatch) {
        config.colors = this.parseConfigObject(colorsMatch[1])
      }

      // borderRadius設定の抽出
      const radiusMatch = content.match(/borderRadius:\s*{([^}]+)}/s)
      if (radiusMatch) {
        config.borderRadius = this.parseConfigObject(radiusMatch[1])
      }

      // animation設定の抽出
      const animationMatch = content.match(/animation:\s*{([^}]+)}/s)
      if (animationMatch) {
        config.animation = this.parseConfigObject(animationMatch[1])
      }

      // keyframes設定の抽出
      const keyframesMatch = content.match(/keyframes:\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      if (keyframesMatch) {
        config.keyframes = this.parseConfigObject(keyframesMatch[1])
      }

    } catch (error) {
      // パースエラーの場合はデフォルト値を返す
    }

    return config
  }

  private parseConfigObject(content: string): Record<string, any> {
    const result: Record<string, any> = {}
    
    try {
      // 簡易的なオブジェクト解析
      const lines = content.split('\n')
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('//')) continue

        // key: value 形式をパース
        const match = trimmed.match(/^['"`]?([^'"`:\s]+)['"`]?\s*:\s*(.+?),?$/)
        if (match) {
          const [, key, value] = match
          result[key] = value.replace(/['"`]/g, '').replace(/,$/, '')
        }
      }
    } catch (error) {
      // パースエラーは無視
    }

    return result
  }

  private categorizeToken(name: string): string {
    if (name.includes('color') || name.match(/^(primary|secondary|destructive|muted|accent|background|foreground|border|input|ring|card|popover)$/)) {
      return 'color'
    }
    if (name.includes('spacing') || name.includes('gap') || name.includes('margin') || name.includes('padding')) {
      return 'spacing'
    }
    if (name.includes('radius')) {
      return 'border-radius'
    }
    if (name.includes('font') || name.includes('text')) {
      return 'typography'
    }
    if (name.includes('shadow')) {
      return 'shadow'
    }
    if (name.includes('animation') || name.includes('transition')) {
      return 'animation'
    }
    return 'other'
  }

  private getTokenDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'background': 'メインの背景色',
      'foreground': 'メインのテキスト色',
      'primary': 'プライマリカラー',
      'primary-foreground': 'プライマリ背景上のテキスト色',
      'secondary': 'セカンダリカラー',
      'secondary-foreground': 'セカンダリ背景上のテキスト色',
      'destructive': '危険・削除アクション色',
      'destructive-foreground': '危険アクション背景上のテキスト色',
      'muted': 'ミュートされた背景色',
      'muted-foreground': 'ミュートされたテキスト色',
      'accent': 'アクセントカラー',
      'accent-foreground': 'アクセント背景上のテキスト色',
      'border': 'ボーダー色',
      'input': '入力フィールドのボーダー色',
      'ring': 'フォーカスリング色',
      'card': 'カード背景色',
      'card-foreground': 'カード上のテキスト色',
      'popover': 'ポップオーバー背景色',
      'popover-foreground': 'ポップオーバー上のテキスト色',
      'radius': 'デフォルトの角丸サイズ'
    }

    return descriptions[name] || ''
  }

  private parseHSL(value: string): { h: number; s: number; l: number } | undefined {
    // "0 0% 100%" 形式のHSL値をパース
    const match = value.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
    if (match) {
      return {
        h: parseFloat(match[1]),
        s: parseFloat(match[2]),
        l: parseFloat(match[3])
      }
    }
    return undefined
  }

  private extractCategories(tokens: Record<string, DesignToken>): string[] {
    const categories = new Set<string>()
    for (const token of Object.values(tokens)) {
      categories.add(token.category)
    }
    return Array.from(categories).sort()
  }

  private filterByCategory(collection: DesignTokenCollection, category: string): DesignTokenCollection {
    const filtered: DesignTokenCollection = {
      light: {},
      dark: {},
      categories: [category],
      generatedAt: collection.generatedAt
    }

    for (const [tokenName, token] of Object.entries(collection.light)) {
      if (token.category === category) {
        filtered.light[tokenName] = token
      }
    }

    for (const [tokenName, token] of Object.entries(collection.dark)) {
      if (token.category === category) {
        filtered.dark[tokenName] = token
      }
    }

    return filtered
  }

  private getColorGroup(tokenName: string): string {
    if (tokenName.startsWith('primary')) return 'primary'
    if (tokenName.startsWith('secondary')) return 'secondary'
    if (tokenName.startsWith('destructive')) return 'destructive'
    if (tokenName.startsWith('muted')) return 'muted'
    if (tokenName.startsWith('accent')) return 'accent'
    if (tokenName.startsWith('card')) return 'card'
    if (tokenName.startsWith('popover')) return 'popover'
    if (tokenName.includes('background') || tokenName.includes('foreground')) return 'base'
    return 'system'
  }
}