#!/usr/bin/env node

// Simple MCP server connectivity test
import { spawn } from 'child_process'

console.log('🔍 Quick MCP Test...')

const server = spawn('nishiken-ui-mcp', [], { stdio: ['pipe', 'pipe', 'pipe'] })

server.stdout.on('data', (data) => {
  console.log('✅ Server responding:', data.toString().substring(0, 100) + '...')
})

server.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString())
})

// Send simple ping
setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'ping'
  }) + '\n')
}, 100)

setTimeout(() => {
  console.log('✅ MCP Server is accessible!')
  server.kill()
}, 1000)

server.on('error', (error) => {
  console.error('❌ Cannot access MCP server:', error.message)
  process.exit(1)
})