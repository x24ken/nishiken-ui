#!/usr/bin/env node

import { spawn } from 'child_process'

const testServerBasics = async () => {
  console.log('🧪 簡易MCPサーバーテスト')
  console.log('=' + '='.repeat(30))

  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['dist/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let hasStarted = false

    // サーバーの標準出力を監視
    serverProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    // サーバーのエラー出力を監視
    serverProcess.stderr.on('data', (data) => {
      const errorText = data.toString()
      if (errorText.includes('Error') || errorText.includes('error')) {
        console.log('❌ サーバーエラー:', errorText)
      }
    })

    // サーバー起動確認のために初期化メッセージを送信
    setTimeout(() => {
      try {
        const initMessage = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'test-client',
              version: '1.0.0'
            }
          }
        }

        console.log('📤 初期化メッセージ送信中...')
        serverProcess.stdin.write(JSON.stringify(initMessage) + '\n')

        // リスト要求を送信
        setTimeout(() => {
          const listMessage = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
          }
          
          console.log('📤 ツール一覧要求送信中...')
          serverProcess.stdin.write(JSON.stringify(listMessage) + '\n')
          
          // 少し待ってからプロセスを終了
          setTimeout(() => {
            console.log('📡 サーバー応答:', output.length > 0 ? '受信' : '未受信')
            if (output.length > 0) {
              console.log('✅ MCPサーバー基本動作確認: 正常')
              // 最初の100文字を表示
              console.log('📝 応答例:', output.substring(0, 100) + '...')
            } else {
              console.log('⚠️  応答が確認できませんでした')
            }
            
            serverProcess.kill()
            resolve(output.length > 0)
          }, 2000)
        }, 1000)
      } catch (error) {
        console.log('❌ テスト実行エラー:', error.message)
        serverProcess.kill()
        reject(error)
      }
    }, 500)

    // プロセス終了時
    serverProcess.on('exit', (code) => {
      console.log(`\n🏁 サーバープロセス終了 (コード: ${code})`)
    })

    // エラー時
    serverProcess.on('error', (error) => {
      console.log('❌ プロセスエラー:', error.message)
      reject(error)
    })
  })
}

// 個別機能テスト関数
const testComponentReader = async () => {
  console.log('\n🔍 ComponentReader単体テスト')
  console.log('-'.repeat(35))

  try {
    const { ComponentReader } = await import('./dist/utils/component-reader.js')
    const reader = new ComponentReader('/Users/x24ken/nishiken-ui/src')
    
    // コンポーネント一覧テスト
    const components = await reader.getComponentList()
    console.log(`✅ コンポーネント一覧: ${components.length}個`)
    console.log(`   - ${components.join(', ')}`)

    // 個別コンポーネント情報テスト
    if (components.includes('button')) {
      const buttonInfo = await reader.getComponentInfo('button')
      console.log(`✅ buttonコンポーネント詳細:`)
      console.log(`   - バリアント: ${buttonInfo.variants.join(', ')}`)
      console.log(`   - 依存関係: ${buttonInfo.dependencies.join(', ')}`)
      console.log(`   - プロパティ数: ${buttonInfo.props.length}`)
    }

    return true
  } catch (error) {
    console.log(`❌ ComponentReader エラー: ${error.message}`)
    return false
  }
}

const testTailwindTokenReader = async () => {
  console.log('\n🎨 TailwindTokenReader単体テスト')
  console.log('-'.repeat(40))

  try {
    const { TailwindTokenReader } = await import('./dist/utils/tailwind-token-reader.js')
    const reader = new TailwindTokenReader('/Users/x24ken/nishiken-ui/src')
    
    // デザイントークンテスト
    const tokens = await reader.getDesignTokens()
    console.log(`✅ デザイントークン取得:`)
    console.log(`   - ライトテーマ: ${Object.keys(tokens.light).length}個`)
    console.log(`   - ダークテーマ: ${Object.keys(tokens.dark).length}個`)
    console.log(`   - カテゴリ: ${tokens.categories.join(', ')}`)

    return true
  } catch (error) {
    console.log(`❌ TailwindTokenReader エラー: ${error.message}`)
    return false
  }
}

// メインテスト実行
const runAllTests = async () => {
  console.log('🚀 nishiken-ui MCPサーバー 総合テスト開始\n')

  const results = []

  // 1. 基本動作テスト
  try {
    const serverTest = await testServerBasics()
    results.push({ name: 'MCPサーバー基本動作', success: serverTest })
  } catch (error) {
    results.push({ name: 'MCPサーバー基本動作', success: false, error: error.message })
  }

  // 2. ComponentReader単体テスト
  const componentTest = await testComponentReader()
  results.push({ name: 'ComponentReader', success: componentTest })

  // 3. TailwindTokenReader単体テスト
  const tokenTest = await testTailwindTokenReader()
  results.push({ name: 'TailwindTokenReader', success: tokenTest })

  // 結果サマリー
  console.log('\n' + '='.repeat(50))
  console.log('📊 テスト結果サマリー')
  console.log('=' + '='.repeat(49))

  const successCount = results.filter(r => r.success).length
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
    if (result.error) {
      console.log(`   エラー: ${result.error}`)
    }
  })

  console.log(`\n🎯 成功率: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`)
  
  if (successCount === results.length) {
    console.log('🎉 全テスト合格！MCPサーバーは正常動作しています')
  } else {
    console.log('⚠️  一部テストが失敗しました。詳細を確認してください')
  }
}

runAllTests().catch(console.error)