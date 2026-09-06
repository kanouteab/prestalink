import { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { StarRating } from '../../components/StarRating/StarRating';
import { useTheme } from '../../theme/ThemeProvider';

export interface ReviewDialogProps {
  visible: boolean;
  providerName: string;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function ReviewDialog({ visible, providerName, pending, onCancel, onSubmit }: ReviewDialogProps) {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,16,33,0.5)', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg }}>
        <View style={{ width: '100%', maxWidth: 360, backgroundColor: theme.colors.surface1, borderRadius: theme.radius.lg, padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.ink900 }}>Noter {providerName}</Text>
          <StarRating value={rating} onChange={setRating} />
          <Input label="Commentaire (optionnel)" value={comment} onChangeText={setComment} multiline numberOfLines={3} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button label="Annuler" variant="secondary" onPress={onCancel} />
            <Button label="Envoyer" onPress={() => onSubmit(rating, comment)} loading={pending} disabled={rating === 0} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
