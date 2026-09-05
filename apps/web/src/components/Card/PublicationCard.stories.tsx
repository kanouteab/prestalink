import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PublicationCard } from './PublicationCard.js';

const meta: Meta<typeof PublicationCard> = {
  title: 'Design system/PublicationCard',
  component: PublicationCard,
};
export default meta;

type Story = StoryObj<typeof PublicationCard>;

export const Offer: Story = {
  args: {
    type: 'OFFER',
    title: "Reparation fuite d'eau a domicile",
    categoryName: 'Plomberie',
    locationLabel: 'Abidjan, Cocody',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 15000,
    authorInitials: 'KB',
    authorName: 'Kouassi B.',
    status: 'AVAILABLE',
  },
};

export const Request: Story = {
  args: {
    type: 'REQUEST',
    title: 'Recherche aide menagere deux fois par semaine',
    categoryName: 'Menage',
    locationLabel: 'Abidjan, Marcory',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    amount: 40000,
    authorInitials: 'AT',
    authorName: 'Aya T.',
    status: 'IN_PROGRESS',
  },
};

export const WithFavoriteToggle: Story = {
  render: (args) => {
    function FavoriteCardDemo() {
      const [favorite, setFavorite] = useState(false);
      return <PublicationCard {...args} favorite={favorite} onToggleFavorite={() => setFavorite((value) => !value)} />;
    }
    return <FavoriteCardDemo />;
  },
  args: Offer.args,
};
