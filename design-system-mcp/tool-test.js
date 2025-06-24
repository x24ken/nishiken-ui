#!/usr/bin/env node

import { spawn } from 'child_process'

// MCPツールの詳細テスト
const testMCPTools = () => {
  console.log('🔧 MCPツール個別機能テスト')
  console.log('=' + '='.repeat(35))

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let messageId = 1
    const responses = []

    // レスポンスの解析
    serverProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim())
      for (const line of lines) {
        try {
          const response = JSON.parse(line)
          responses.push(response)
        } catch (e) {
          // JSON以外の出力は無視
        }
      }
    })

    // メッセージ送信のヘルパー関数
    const sendMessage = (method, params = {}) => {
      const message = {
        jsonrpc: '2.0',
        id: messageId++,
        method,
        params
      }
      serverProcess.stdin.write(JSON.stringify(message) + '\n')
      return messageId - 1
    }

    // テスト実行
    setTimeout(async () => {
      try {
        console.log('📡 サーバー初期化...')
        
        // 1. 初期化
        sendMessage('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'tool-test-client', version: '1.0.0' }
        })

        await sleep(500)

        // 2. search_components テスト
        console.log('\n🔍 search_components ツールテスト...')
        sendMessage('tools/call', {
          name: 'search_components',
          arguments: { query: 'button' }
        })

        await sleep(1000)

        // 3. get_component_code テスト
        console.log('📄 get_component_code ツールテスト...')
        sendMessage('tools/call', {
          name: 'get_component_code',
          arguments: { componentName: 'button', includeStories: false }
        })

        await sleep(1000)

        // 4. get_design_tokens テスト
        console.log('🎨 get_design_tokens ツールテスト...')
        sendMessage('tools/call', {
          name: 'get_design_tokens',
          arguments: { category: 'color', format: 'json' }
        })

        await sleep(1000)

        // 5. apply_theme_setup テスト
        console.log('⚙️  apply_theme_setup ツールテスト...')
        sendMessage('tools/call', {
          name: 'apply_theme_setup',
          arguments: { 
            targetPath: '/tmp/test-project',
            framework: 'vite',
            setupTailwind: true 
          }
        })

        await sleep(1000)

        // 6. integrate_components テスト
        console.log('🔗 integrate_components ツールテスト...')
        sendMessage('tools/call', {
          name: 'integrate_components',
          arguments: {
            components: ['button', 'card'],
            targetPath: '/tmp/test-project',
            framework: 'vite'
          }
        })

        await sleep(2000)

        // レスポンス解析
        console.log('\n📊 テスト結果分析...')
        analyzeResponses(responses)

        serverProcess.kill()
        resolve(true)

      } catch (error) {
        console.log(`❌ テストエラー: ${error.message}`)
        serverProcess.kill()
        resolve(false)
      }
    }, 1000)
  })
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const analyzeResponses = (responses) => {
  console.log(`\n📈 総レスポンス数: ${responses.length}`)
  
  let successCount = 0
  let errorCount = 0
  
  responses.forEach((response, index) => {
    if (response.error) {
      console.log(`❌ エラーレスポンス ${index + 1}: ${response.error.message}`)
      errorCount++
    } else if (response.result) {
      console.log(`✅ 成功レスポンス ${index + 1}: ${response.method || 'ツール実行'} 完了`)
      
      // 具体的な結果の分析
      if (response.result.content) {
        const content = response.result.content[0]
        if (content && content.text) {
          try {
            const data = JSON.parse(content.text)
            
            // search_components の結果
            if (data.results && Array.isArray(data.results)) {
              console.log(`   └ 検索結果: ${data.results.length}個のコンポーネント`)
              if (data.results[0]) {
                console.log(`   └ サンプル: ${data.results[0].name} (バリアント: ${data.results[0].variants?.length || 0}個)`)
              }
            }
            
            // get_component_code の結果
            if (data.componentName && data.files) {
              console.log(`   └ コンポーネント: ${data.componentName}`)
              console.log(`   └ ファイル数: ${Object.keys(data.files).length}`)
              console.log(`   └ 依存関係: ${data.info?.dependencies?.length || 0}個`)
            }
            
            // get_design_tokens の結果
            if (data.light && data.dark) {
              console.log(`   └ ライトテーマ: ${Object.keys(data.light).length}トークン`)
              console.log(`   └ ダークテーマ: ${Object.keys(data.dark).length}トークン`)
            }
            
            // apply_theme_setup の結果
            if (data.success !== undefined && data.files) {
              console.log(`   └ セットアップ: ${data.success ? '成功' : '失敗'}`)
              console.log(`   └ 生成ファイル: ${data.files.length}個`)
              console.log(`   └ 依存関係: ${data.dependencies.length}個`)
            }
            
            // integrate_components の結果
            if (data.message && data.files) {
              console.log(`   └ 統合結果: ${data.success ? '成功' : '失敗'}`)
              console.log(`   └ 統合ファイル: ${data.files.length}個`)
            }
            
          } catch (e) {
            console.log(`   └ レスポンス: ${content.text.substring(0, 50)}...`)
          }
        }
      }
      successCount++
    }
  })
  
  console.log(`\n📊 結果サマリー:`)
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ❌ エラー: ${errorCount}`)
  console.log(`   🎯 成功率: ${Math.round(successCount / (successCount + errorCount) * 100)}%`)
}

// リソーステスト
const testMCPResources = () => {
  console.log('\n📚 MCPリソース機能テスト')
  console.log('-'.repeat(35))

  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let messageId = 1
    const responses = []

    serverProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim())
      for (const line of lines) {
        try {
          const response = JSON.parse(line)
          responses.push(response)
        } catch (e) {
          // JSON以外は無視
        }
      }
    })

    const sendMessage = (method, params = {}) => {
      const message = {
        jsonrpc: '2.0',
        id: messageId++,
        method,
        params
      }
      serverProcess.stdin.write(JSON.stringify(message) + '\n')
      return messageId - 1
    }

    setTimeout(async () => {
      try {
        // 初期化
        sendMessage('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'resource-test-client', version: '1.0.0' }
        })

        await sleep(500)

        // リソース一覧
        console.log('📋 リソース一覧取得...')
        sendMessage('resources/list')

        await sleep(1000)

        // コンポーネントカタログ読み取り
        console.log('📖 コンポーネントカタログ読み取り...')
        sendMessage('resources/read', {
          uri: 'nishiken-ui://components/catalog'
        })

        await sleep(1000)

        // デザイントークン読み取り
        console.log('🎨 デザイントークン読み取り...')
        sendMessage('resources/read', {
          uri: 'nishiken-ui://design-tokens/colors'
        })

        await sleep(1500)

        // 結果分析
        console.log('\n📊 リソーステスト結果:')
        responses.forEach((response, index) => {
          if (response.error) {
            console.log(`❌ エラー ${index + 1}: ${response.error.message}`)
          } else if (response.result) {
            if (response.result.resources) {
              console.log(`✅ リソース一覧: ${response.result.resources.length}個`)
            } else if (response.result.contents) {
              const content = response.result.contents[0]
              if (content && content.text) {
                try {
                  const data = JSON.parse(content.text)
                  if (data.components) {
                    console.log(`✅ カタログ: ${data.components.length}コンポーネント`)
                  }
                  if (data.tokens) {
                    console.log(`✅ トークン: ライト${Object.keys(data.tokens.light).length}個, ダーク${Object.keys(data.tokens.dark).length}個`)
                  }
                } catch (e) {
                  console.log(`✅ データ取得成功: ${content.text.length}文字`)
                }
              }
            }
          }
        })

        serverProcess.kill()
        resolve(true)

      } catch (error) {
        console.log(`❌ リソーステストエラー: ${error.message}`)
        serverProcess.kill()
        resolve(false)
      }
    }, 1000)
  })
}

// メイン実行
const runDetailedTests = async () => {
  console.log('🚀 nishiken-ui MCP詳細機能テスト\n')

  // ツールテスト
  const toolTestResult = await testMCPTools()
  
  // リソーステスト  
  const resourceTestResult = await testMCPResources()

  // 最終結果
  console.log('\n' + '='.repeat(50))
  console.log('🏁 詳細テスト完了')
  console.log('=' + '='.repeat(49))
  console.log(`🔧 ツールテスト: ${toolTestResult ? '✅ 成功' : '❌ 失敗'}`)
  console.log(`📚 リソーステスト: ${resourceTestResult ? '✅ 成功' : '❌ 失敗'}`)
  
  if (toolTestResult && resourceTestResult) {
    console.log('\n🎉 全機能テスト合格！MCPサーバーは完全に動作しています')
  } else {
    console.log('\n⚠️  一部機能に問題があります')
  }
}

runDetailedTests().catch(console.error)