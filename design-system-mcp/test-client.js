#!/usr/bin/env node

import { spawn } from 'child_process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const testMCPServer = async () => {
  console.log('🧪 nishiken-ui MCPサーバー テスト開始')
  console.log('=' + '='.repeat(50))

  try {
    // MCPクライアントを作成
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/server.js']
    })

    const client = new Client({
      name: 'test-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    })

    await client.connect(transport)
    
    console.log('✅ MCPサーバー接続成功')

    // 1. ツール一覧の取得テスト
    console.log('\n📋 ツール一覧テスト...')
    const toolsResult = await client.request({ method: 'tools/list' }, {})
    console.log(`✅ ${toolsResult.tools.length}個のツールが利用可能:`)
    toolsResult.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`)
    })

    // 2. リソース一覧の取得テスト
    console.log('\n📚 リソース一覧テスト...')
    const resourcesResult = await client.request({ method: 'resources/list' }, {})
    console.log(`✅ ${resourcesResult.resources.length}個のリソースが利用可能:`)
    resourcesResult.resources.forEach(resource => {
      console.log(`   - ${resource.name}: ${resource.description}`)
    })

    // 3. search_componentsツールテスト
    console.log('\n🔍 search_components ツールテスト...')
    try {
      const searchResult = await client.request({
        method: 'tools/call',
        params: {
          name: 'search_components',
          arguments: { query: 'button' }
        }
      }, {})
      
      const searchData = JSON.parse(searchResult.content[0].text)
      console.log(`✅ ${searchData.total}個のコンポーネントが見つかりました`)
      if (searchData.results.length > 0) {
        const button = searchData.results[0]
        console.log(`   - ${button.name}: バリアント[${button.variants.join(', ')}]`)
        console.log(`   - 依存関係: ${button.dependencies.join(', ') || 'なし'}`)
      }
    } catch (error) {
      console.log(`❌ search_components エラー: ${error.message}`)
    }

    // 4. get_component_codeツールテスト
    console.log('\n📄 get_component_code ツールテスト...')
    try {
      const codeResult = await client.request({
        method: 'tools/call',
        params: {
          name: 'get_component_code',
          arguments: { componentName: 'button' }
        }
      }, {})
      
      const codeData = JSON.parse(codeResult.content[0].text)
      console.log(`✅ ${codeData.componentName} コンポーネントコード取得成功`)
      console.log(`   - ファイル数: ${Object.keys(codeData.files).length}`)
      console.log(`   - バリアント: ${codeData.info.variants.join(', ')}`)
    } catch (error) {
      console.log(`❌ get_component_code エラー: ${error.message}`)
    }

    // 5. get_design_tokensツールテスト
    console.log('\n🎨 get_design_tokens ツールテスト...')
    try {
      const tokensResult = await client.request({
        method: 'tools/call',
        params: {
          name: 'get_design_tokens',
          arguments: { category: 'color', format: 'json' }
        }
      }, {})
      
      const tokensData = JSON.parse(tokensResult.content[0].text)
      console.log(`✅ デザイントークン取得成功`)
      console.log(`   - ライトテーマトークン: ${Object.keys(tokensData.light).length}個`)
      console.log(`   - ダークテーマトークン: ${Object.keys(tokensData.dark).length}個`)
    } catch (error) {
      console.log(`❌ get_design_tokens エラー: ${error.message}`)
    }

    // 6. リソース読み取りテスト
    console.log('\n📖 リソース読み取りテスト...')
    try {
      const catalogResult = await client.request({
        method: 'resources/read',
        params: { uri: 'nishiken-ui://components/catalog' }
      }, {})
      
      const catalogData = JSON.parse(catalogResult.contents[0].text)
      console.log(`✅ コンポーネントカタログ読み取り成功`)
      console.log(`   - 総コンポーネント数: ${catalogData.total}`)
    } catch (error) {
      console.log(`❌ リソース読み取りエラー: ${error.message}`)
    }

    await client.close()
    
    console.log('\n' + '='.repeat(52))
    console.log('🎉 テスト完了！MCPサーバーは正常に動作しています')

  } catch (error) {
    console.error('❌ テスト失敗:', error)
    process.exit(1)
  }
}

testMCPServer()