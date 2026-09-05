import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState.js';
import { Button } from '../Button/Button.js';

const meta: Meta<typeof EmptyState> = {
  title: 'Design system/EmptyState',
  component: EmptyState,
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const NoResults: Story = {
  args: { title: 'Aucun resultat', message: 'Essayez d\'elargir votre recherche ou vos filtres.' },
};

export const WithAction: Story = {
  args: {
    glyph: '📭',
    title: 'Aucune publication',
    message: "Vous n'avez pas encore publie d'offre ou de demande.",
    action: <Button variant="primary">Publier maintenant</Button>,
  },
};
