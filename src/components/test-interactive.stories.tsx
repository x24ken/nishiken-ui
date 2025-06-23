import type { Meta, StoryObj } from '@storybook/react'
import { TestInteractive } from './test-interactive'

const meta = {
  title: 'Test/Interactive Test',
  component: TestInteractive,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TestInteractive>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}