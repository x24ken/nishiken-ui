#!/usr/bin/env node

import { spawn } from 'child_process'

console.log('🧪 Testing nishiken-ui MCP Server...\n')

// MCP servers communicate via stdio with JSON-RPC
const server = spawn('nishiken-ui-mcp', [], {
  stdio: ['pipe', 'pipe', 'pipe']
})

let responseCount = 0
const responses = []

server.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim())
  lines.forEach(line => {
    try {
      const response = JSON.parse(line)
      responses.push(response)
      responseCount++
      
      if (response.result?.tools) {
        console.log('✅ Tools available:', response.result.tools.length)
        response.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`)
        })
      }
      
      if (response.result?.results) {
        console.log('✅ Search results:', response.result.results.length)
        response.result.results.forEach(comp => {
          console.log(`   - ${comp.name}: ${comp.description}`)
        })
      }
    } catch (e) {
      // Ignore non-JSON output
    }
  })
})

server.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString())
})

// Test sequence
setTimeout(() => {
  console.log('📡 Sending initialize request...')
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  }) + '\n')
}, 100)

setTimeout(() => {
  console.log('📡 Requesting available tools...')
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  }) + '\n')
}, 500)

setTimeout(() => {
  console.log('📡 Testing component search...')
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_components',
      arguments: {
        query: 'button',
        category: 'button'
      }
    }
  }) + '\n')
}, 1000)

// Cleanup after tests
setTimeout(() => {
  console.log('\n🏁 Test completed')
  console.log(`📊 Received ${responseCount} responses`)
  
  if (responseCount >= 2) {
    console.log('✅ MCP Server is working correctly!')
  } else {
    console.log('❌ MCP Server may have issues')
  }
  
  server.kill()
  process.exit(0)
}, 2000)

server.on('error', (error) => {
  console.error('❌ Failed to start MCP server:', error.message)
  process.exit(1)
})