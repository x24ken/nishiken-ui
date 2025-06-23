import type { Meta, StoryObj } from '@storybook/react'
import { Heading } from './heading'
import { Text } from './text'

const meta = {
  title: 'Components/Typography',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AllHeadings: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level="h1">Heading 1</Heading>
      <Heading level="h2">Heading 2</Heading>
      <Heading level="h3">Heading 3</Heading>
      <Heading level="h4">Heading 4</Heading>
      <Heading level="h5">Heading 5</Heading>
      <Heading level="h6">Heading 6</Heading>
    </div>
  ),
}

export const TextVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Text variant="p">
        This is a paragraph with standard text. It includes proper line height
        and spacing for readability in long-form content.
      </Text>
      <Text variant="lead">
        This is lead text, slightly larger and used for introductions.
      </Text>
      <Text variant="large">This is large text for emphasis.</Text>
      <Text variant="small">This is small text for fine print.</Text>
      <Text variant="muted">This is muted text for secondary information.</Text>
      <Text variant="code" as="code">
        const example = 'This is code text'
      </Text>
    </div>
  ),
}

export const CompleteExample: Story = {
  render: () => (
    <article className="prose max-w-3xl">
      <Heading level="h1">Building a Design System</Heading>
      <Text variant="lead">
        A comprehensive guide to creating reusable UI components with React and
        TypeScript.
      </Text>
      
      <Heading level="h2" className="mt-8">
        Introduction
      </Heading>
      <Text>
        Design systems are essential for maintaining consistency across large
        applications. They provide a shared language between designers and
        developers, ensuring that UI components are reusable and maintainable.
      </Text>
      
      <Heading level="h3" className="mt-6">
        Core Principles
      </Heading>
      <Text>
        When building a design system, consider these key principles:
      </Text>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <Text as="span" variant="small">
            Consistency across all components
          </Text>
        </li>
        <li>
          <Text as="span" variant="small">
            Accessibility as a first-class concern
          </Text>
        </li>
        <li>
          <Text as="span" variant="small">
            Performance and bundle size optimization
          </Text>
        </li>
      </ul>
      
      <Text variant="muted">
        Last updated: {new Date().toLocaleDateString()}
      </Text>
    </article>
  ),
}