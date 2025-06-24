import fs from 'fs/promises'
import path from 'path'

export interface ComponentInfo {
  name: string
  path: string
  description: string
  variants: string[]
  hasStories: boolean
  hasTypes: boolean
  dependencies: string[]
  props: ComponentProp[]
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: string
}

export interface ComponentCode {
  tsx: string
  stories?: string
  index?: string
  types?: string
}

export class ComponentReader {
  private readonly basePath: string

  constructor(designSystemPath: string) {
    this.basePath = path.resolve(designSystemPath, 'components')
  }

  async getComponentList(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.basePath, { withFileTypes: true })
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort()
    } catch (error) {
      throw new Error(`コンポーネント一覧の取得に失敗しました: ${error}`)
    }
  }

  async getComponentInfo(componentName: string): Promise<ComponentInfo> {
    const componentDir = path.join(this.basePath, componentName)
    const componentFile = path.join(componentDir, `${componentName}.tsx`)

    try {
      // メインファイルの存在確認
      await fs.access(componentFile)
    } catch (error) {
      throw new Error(`コンポーネント '${componentName}' が見つかりません`)
    }

    const [
      tsxContent,
      hasStories,
      hasTypes,
      indexContent
    ] = await Promise.all([
      fs.readFile(componentFile, 'utf-8'),
      this.fileExists(path.join(componentDir, `${componentName}.stories.tsx`)),
      this.fileExists(path.join(componentDir, `${componentName}.types.ts`)),
      this.safeReadFile(path.join(componentDir, 'index.ts'))
    ])

    return {
      name: componentName,
      path: `src/components/${componentName}`,
      description: this.extractDescription(tsxContent),
      variants: this.extractVariants(tsxContent),
      hasStories,
      hasTypes,
      dependencies: this.extractDependencies(tsxContent, indexContent),
      props: this.extractProps(tsxContent)
    }
  }

  async getComponentCode(componentName: string, options: {
    includeStories?: boolean
    includeTypes?: boolean
    includeIndex?: boolean
  } = {}): Promise<ComponentCode> {
    const componentDir = path.join(this.basePath, componentName)
    const { includeStories = false, includeTypes = false, includeIndex = true } = options

    const result: ComponentCode = {
      tsx: await fs.readFile(path.join(componentDir, `${componentName}.tsx`), 'utf-8')
    }

    if (includeIndex) {
      result.index = await this.safeReadFile(path.join(componentDir, 'index.ts'))
    }

    if (includeStories) {
      result.stories = await this.safeReadFile(path.join(componentDir, `${componentName}.stories.tsx`))
    }

    if (includeTypes) {
      result.types = await this.safeReadFile(path.join(componentDir, `${componentName}.types.ts`))
    }

    return result
  }

  async searchComponents(query: string, category?: string): Promise<ComponentInfo[]> {
    const componentNames = await this.getComponentList()
    
    const filteredNames = componentNames.filter(name => {
      if (category && name.toLowerCase() !== category.toLowerCase()) return false
      if (query && !name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })

    const results = await Promise.all(
      filteredNames.map(name => this.getComponentInfo(name))
    )

    return results.filter(Boolean)
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async safeReadFile(filePath: string): Promise<string | undefined> {
    try {
      return await fs.readFile(filePath, 'utf-8')
    } catch {
      return undefined
    }
  }

  private extractDescription(content: string): string {
    // JSDocコメントからの説明抽出
    const jsDocMatch = content.match(/\/\*\*(.*?)\*\//s)
    if (jsDocMatch) {
      return jsDocMatch[1]
        .replace(/\*/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join(' ')
        .trim()
    }

    // displayNameからの推測
    const displayNameMatch = content.match(/\.displayName\s*=\s*['"`]([^'"`]+)['"`]/)
    if (displayNameMatch) {
      return `${displayNameMatch[1]} component`
    }

    return ''
  }

  private extractVariants(content: string): string[] {
    try {
      // CVAのvariants定義を抽出
      const variantsMatch = content.match(/variants:\s*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      if (!variantsMatch) return []

      const variantsContent = variantsMatch[1]
      const variantNames: string[] = []

      // 各バリアント名を抽出（ネストした{}を考慮）
      const lines = variantsContent.split('\n')
      for (const line of lines) {
        const match = line.trim().match(/^(\w+):\s*{/)
        if (match) {
          variantNames.push(match[1])
        }
      }

      return variantNames
    } catch (error) {
      return []
    }
  }

  private extractDependencies(tsxContent: string, indexContent?: string): string[] {
    const dependencies = new Set<string>()

    // import文からの抽出
    const importMatches = [
      ...tsxContent.matchAll(/^import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/gm),
      ...(indexContent?.matchAll(/^export\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/gm) || [])
    ]

    for (const match of importMatches) {
      const moduleName = match[1]
      if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
        dependencies.add(moduleName)
      }
    }

    return Array.from(dependencies).sort()
  }

  private extractProps(content: string): ComponentProp[] {
    const props: ComponentProp[] = []

    try {
      // interface定義からpropsを抽出
      const interfaceMatch = content.match(/export\s+interface\s+\w+Props[^{]*{([^}]+(?:{[^}]*}[^}]*)*)}/s)
      if (!interfaceMatch) return props

      const interfaceContent = interfaceMatch[1]
      const lines = interfaceContent.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue

        // プロパティ行をパース: "name?: type" or "name: type"
        const propMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;,]+)/)
        if (propMatch) {
          const [, name, optional, type] = propMatch
          props.push({
            name,
            type: type.trim(),
            required: !optional,
            description: this.extractPropDescription(line)
          })
        }
      }
    } catch (error) {
      // エラーの場合は空配列を返す
    }

    return props
  }

  private extractPropDescription(line: string): string | undefined {
    // 同じ行または直前の行のコメントから説明を抽出
    const commentMatch = line.match(/\/\*\*(.*?)\*\//) || line.match(/\/\/\s*(.+)/)
    return commentMatch ? commentMatch[1].trim() : undefined
  }
}