import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.js';

const meta: Meta<typeof Button> = {
  title: 'Design system/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'danger', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Publier une offre', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Annuler', variant: 'secondary' } };
export const Outline: Story = { args: { children: 'Voir le profil', variant: 'outline' } };
export const Danger: Story = { args: { children: 'Supprimer', variant: 'danger' } };
export const Ghost: Story = { args: { children: 'Ignorer', variant: 'ghost' } };
export const Loading: Story = { args: { children: 'Envoi...', variant: 'primary', loading: true } };
export const Disabled: Story = { args: { children: 'Indisponible', variant: 'primary', disabled: true } };
