import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, PublicationStatusBadge, PublicationTypeBadge } from './Badge.js';

const meta: Meta<typeof Badge> = {
  title: 'Design system/Badge',
  component: Badge,
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge tone="offre">Offre</Badge>
      <Badge tone="demande">Demande</Badge>
      <Badge tone="success">Disponible</Badge>
      <Badge tone="brand">En cours</Badge>
      <Badge tone="neutral">Terminee</Badge>
      <Badge tone="danger">Expiree</Badge>
    </div>
  ),
};

export const StatusMapping: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <PublicationStatusBadge status="AVAILABLE" />
      <PublicationStatusBadge status="IN_PROGRESS" />
      <PublicationStatusBadge status="COMPLETED" />
      <PublicationStatusBadge status="SUSPENDED" />
      <PublicationStatusBadge status="EXPIRED" />
      <PublicationTypeBadge type="OFFER" />
      <PublicationTypeBadge type="REQUEST" />
    </div>
  ),
};
