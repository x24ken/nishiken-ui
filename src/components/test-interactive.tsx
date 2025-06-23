import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

export function TestInteractive() {
  const [count, setCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [clickLog, setClickLog] = useState<string[]>([])

  const handleButtonClick = (action: string) => {
    setClickLog([...clickLog, `${new Date().toLocaleTimeString()}: ${action}`])
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Button Interaction Test</CardTitle>
          <CardDescription>Test if buttons are clickable and working</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-2xl font-bold">
            Count: {count}
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => {
                setCount(count + 1)
                handleButtonClick('Increment')
              }}
            >
              Increment
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setCount(count - 1)
                handleButtonClick('Decrement')
              }}
            >
              Decrement
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setCount(0)
                handleButtonClick('Reset')
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input Interaction Test</CardTitle>
          <CardDescription>Test if input fields accept typing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Type here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="text-sm text-muted-foreground">
            You typed: <span className="font-mono">{inputValue || '(nothing yet)'}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Character count: {inputValue.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Click Log</CardTitle>
          <CardDescription>Shows button click history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {clickLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clicks yet</p>
            ) : (
              clickLog.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}