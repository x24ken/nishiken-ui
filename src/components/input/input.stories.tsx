import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'
import { useState } from 'react'

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const ControlledInput: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div className="space-y-4">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type something..."
        />
        <p className="text-sm text-muted-foreground">
          Current value: {value || '(empty)'}
        </p>
      </div>
    )
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Username
      </label>
      <Input id="username" placeholder="Enter username" />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    })

    return (
      <form className="w-full max-w-sm space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Name
          </label>
          <Input 
            id="name" 
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input 
            id="email" 
            type="email" 
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <Input 
            id="password" 
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Form Data:</p>
          <pre className="text-xs">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </form>
    )
  },
}

export const FileInput: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <Input type="file" />
    </div>
  ),
}