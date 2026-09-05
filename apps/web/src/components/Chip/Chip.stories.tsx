import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from './Chip.js';

const meta: Meta<typeof Chip> = {
  title: 'Design system/Chip',
  component: Chip,
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Static: Story = { args: { as: 'span', children: '📍 Abidjan' } };
export const Selectable: Story = { args: { as: 'button', children: 'Menage' } };
export const Selected: Story = { args: { as: 'button', children: 'Menage', selected: true } };
