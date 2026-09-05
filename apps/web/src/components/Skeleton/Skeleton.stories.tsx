import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublicationCardSkeleton } from './Skeleton.js';

const meta: Meta<typeof PublicationCardSkeleton> = {
  title: 'Design system/Skeleton',
  component: PublicationCardSkeleton,
};
export default meta;

type Story = StoryObj<typeof PublicationCardSkeleton>;

export const PublicationCard: Story = {};
