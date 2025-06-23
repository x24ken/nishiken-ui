import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from '../button'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a simple card with minimal content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm">New message from Alice</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm">Project update available</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <p className="text-sm">Meeting reminder: 3PM today</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Mark as read</Button>
        <Button>View all</Button>
      </CardFooter>
    </Card>
  ),
}

export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
          <div className="space-y-1">
            <CardTitle>Jane Doe</CardTitle>
            <CardDescription>Software Engineer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Building amazing products with React and TypeScript. Passionate about
          design systems and developer experience.
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Connect</Button>
      </CardFooter>
    </Card>
  ),
}

export const GridLayout: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>Project {i + 1}</CardTitle>
            <CardDescription>Description for project {i + 1}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is some content for project {i + 1}. It contains various
              details about the project.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}