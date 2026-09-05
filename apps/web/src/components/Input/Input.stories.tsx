import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input.js';

const meta: Meta<typeof Input> = {
  title: 'Design system/Input',
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: "Titre de l'annonce", placeholder: 'Ex : Cours de soutien scolaire' },
};

export const WithHelpText: Story = {
  args: { label: 'Budget (FCFA)', defaultValue: '45 000', helpText: 'Visible par tous les utilisateurs' },
};

export const WithError: Story = {
  args: { label: 'Telephone', defaultValue: '0102', errorText: 'Numero invalide' },
};
