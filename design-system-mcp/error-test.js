#!/usr/bin/env node

import { spawn } from 'child_process'

// エラーハンドリングテスト
const testErrorHandling = () => {
  console.log('🚨 エラーハンドリングテスト')
  console.log('=' + '='.repeat(30))

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

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    setTimeout(async () => {
      try {
        // 初期化
        sendMessage('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'error-test-client', version: '1.0.0' }
        })

        await sleep(500)

        console.log('1️⃣ 存在しないコンポーネント検索テスト...')
        sendMessage('tools/call', {
          name: 'search_components',
          arguments: { query: 'nonexistent_component_xyz' }
        })

        await sleep(1000)

        console.log('2️⃣ 存在しないコンポーネントコード取得テスト...')
        sendMessage('tools/call', {
          name: 'get_component_code',
          arguments: { componentName: 'nonexistent_component' }
        })

        await sleep(1000)

        console.log('3️⃣ 無効なカテゴリでトークン取得テスト...')
        sendMessage('tools/call', {
          name: 'get_design_tokens',
          arguments: { category: 'invalid_category', format: 'json' }
        })

        await sleep(1000)

        console.log('4️⃣ 無効なパラメータでテーマセットアップテスト...')
        sendMessage('tools/call', {
          name: 'apply_theme_setup',
          arguments: { 
            targetPath: '', // 空のパス
            framework: 'invalid_framework'
          }
        })

        await sleep(1000)

        console.log('5️⃣ 無効なツール名テスト...')
        sendMessage('tools/call', {
          name: 'invalid_tool_name',
          arguments: {}
        })

        await sleep(1000)

        console.log('6️⃣ 無効なリソースURIテスト...')
        sendMessage('resources/read', {
          uri: 'invalid://resource/uri'
        })

        await sleep(1500)

        // 結果分析
        console.log('\n📊 エラーハンドリング結果分析...')
        analyzeErrorResponses(responses)

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

const analyzeErrorResponses = (responses) => {
  console.log(`\n📈 総レスポンス数: ${responses.length}`)
  
  let properErrorCount = 0
  let unexpectedSuccessCount = 0
  let otherCount = 0
  
  responses.forEach((response, index) => {
    if (index === 0) {
      // 初期化レスポンスはスキップ
      return
    }

    if (response.error) {
      console.log(`✅ 期待通りのエラー ${index}: ${response.error.message}`)
      properErrorCount++
    } else if (response.result) {
      // 結果を詳しく調べる
      if (response.result.content) {
        const content = response.result.content[0]
        if (content && content.text) {
          try {
            const data = JSON.parse(content.text)
            
            // 空の結果は正常（検索結果0件など）
            if (data.results && data.results.length === 0) {
              console.log(`✅ 正常な空結果 ${index}: 検索結果0件`)
              properErrorCount++
            } else if (data.success === false) {
              console.log(`✅ 正常な失敗レスポンス ${index}: ${data.message}`)
              properErrorCount++
            } else {
              console.log(`❌ 予期しない成功 ${index}: ${JSON.stringify(data).substring(0, 100)}...`)
              unexpectedSuccessCount++
            }
          } catch (e) {
            console.log(`⚠️  解析不能レスポンス ${index}`)
            otherCount++
          }
        }
      } else {
        console.log(`⚠️  想定外のレスポンス形式 ${index}`)
        otherCount++
      }
    } else {
      console.log(`⚠️  その他のレスポンス ${index}`)
      otherCount++
    }
  })
  
  console.log(`\n📊 エラーハンドリング結果:`)
  console.log(`   ✅ 適切なエラー処理: ${properErrorCount}`)
  console.log(`   ❌ 予期しない成功: ${unexpectedSuccessCount}`)
  console.log(`   ⚠️  その他: ${otherCount}`)
  
  const totalTests = properErrorCount + unexpectedSuccessCount + otherCount
  if (totalTests > 0) {
    console.log(`   🎯 エラーハンドリング率: ${Math.round(properErrorCount / totalTests * 100)}%`)
  }
  
  if (unexpectedSuccessCount === 0) {
    console.log('\n🎉 エラーハンドリングは適切に機能しています！')
  } else {
    console.log('\n⚠️  一部のエラーケースで適切な処理がされていません')
  }
}

// メイン実行
const runErrorTests = async () => {
  console.log('🚀 nishiken-ui MCPエラーハンドリングテスト開始\n')

  const result = await testErrorHandling()

  console.log('\n' + '='.repeat(50))
  console.log('🏁 エラーハンドリングテスト完了')
  console.log('=' + '='.repeat(49))
  
  if (result) {
    console.log('✅ エラーハンドリングテスト正常完了')
  } else {
    console.log('❌ エラーハンドリングテストで問題が発生')
  }
}

runErrorTests().catch(console.error)