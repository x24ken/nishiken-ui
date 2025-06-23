import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'Components/Button/Enhanced Effects',
  component: Button,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const AllVariantsGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Default</p>
        <Button>Click me</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Destructive</p>
        <Button variant="destructive">Click me</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Outline</p>
        <Button variant="outline">Click me</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Secondary</p>
        <Button variant="secondary">Click me</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Ghost</p>
        <Button variant="ghost">Click me</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Link</p>
        <Button variant="link">Click me</Button>
      </div>
    </div>
  ),
}

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      </Button>
    </div>
  ),
}

export const InteractionStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Normal State</h3>
        <div className="flex gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disabled State</h3>
        <div className="flex gap-2">
          <Button disabled>Default</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="secondary" disabled>Secondary</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <div className="flex gap-2">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            Confirm
          </Button>
          <Button variant="destructive">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
            Delete
          </Button>
        </div>
      </div>
    </div>
  ),
}