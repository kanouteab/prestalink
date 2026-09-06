import { Modal, Text, View } from 'react-native';
import { Button, type ButtonVariant } from '../Button/Button';
import { useTheme } from '../../theme/ThemeProvider';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Equivalent RN de apps/web/.../ConfirmDialog.tsx : remplace les Alert.alert a bouton unique pour les actions destructives (livrable A, point 8). */
export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', confirmVariant = 'danger', pending, onConfirm, onCancel }: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,16,33,0.5)', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg }}>
        <View style={{ width: '100%', maxWidth: 340, backgroundColor: theme.colors.surface1, borderRadius: theme.radius.lg, padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.ink900 }}>{title}</Text>
          <Text style={{ fontSize: 14, color: theme.colors.ink500 }}>{message}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
            <Button label={confirmLabel} variant={confirmVariant} onPress={onConfirm} loading={pending} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
