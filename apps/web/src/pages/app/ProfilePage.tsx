import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '@prestalink/validation';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile, useUploadProfilePhoto } from '../../hooks/useProfile';
import { apiClient } from '../../services/apiClient';
import { Badge, Button, Input, useToast } from '../../components';
import { initials } from '../../utils/format';
import shared from '../shared.module.css';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      role: user?.role === 'PRESTATAIRE' ? 'PRESTATAIRE' : 'CLIENT',
      country: user?.country ?? '',
      city: user?.city ?? '',
      streetAddress: user?.streetAddress ?? '',
      postalCode: user?.postalCode ?? '',
    },
  });

  const role = watch('role');

  if (!user) return null;

  const onSubmit = handleSubmit((values) => {
    // PUT /api/users/{id} ecrase tout le profil (pas de fusion partielle cote
    // backend) : on renvoie l'utilisateur complet avec les champs du
    // formulaire par-dessus, sinon l'email (non-nullable) et les autres
    // champs non presents dans le formulaire seraient ecrits a null.
    updateProfile.mutate(
      { ...user, ...values },
      {
        onSuccess: () => showToast('Profil mis a jour', 'success'),
        onError: () => showToast('Impossible de mettre a jour le profil', 'error'),
      },
    );
  });

  const onPhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadPhoto.mutate(file, {
      onSuccess: () => showToast('Photo mise a jour', 'success'),
      onError: () => showToast("Impossible d'envoyer la photo", 'error'),
    });
  };

  return (
    <div className={shared.narrow} style={{ padding: 0 }}>
      <header className={shared.pageHeader}>
        <h1>Mon profil</h1>
        <p>Vos informations visibles par les autres utilisateurs de PrestaLink.</p>
      </header>

      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <div className={styles.photoRow}>
          <div className={styles.avatar}>
            {user.photoUrl ? <img src={apiClient.resolveAssetUrl(user.photoUrl)} alt="" /> : initials(user.fullName)}
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} loading={uploadPhoto.isPending}>
              Changer la photo
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPhotoSelected} />
            <div className={styles.badges}>
              {user.verifiedProfile && <Badge tone="success">Profil verifie</Badge>}
              {user.trustBadge && <Badge tone="brand">{user.trustBadge}</Badge>}
            </div>
          </div>
        </div>

        <div className={styles.roleRow}>
          <button
            type="button"
            className={[styles.roleOption, role === 'CLIENT' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'CLIENT')}
          >
            🙋 Client
          </button>
          <button
            type="button"
            className={[styles.roleOption, role === 'PRESTATAIRE' && styles.selected].filter(Boolean).join(' ')}
            onClick={() => setValue('role', 'PRESTATAIRE')}
          >
            🛠️ Prestataire
          </button>
        </div>

        <Input label="Nom complet" errorText={errors.fullName?.message} {...register('fullName')} />
        <Input label="E-mail" value={user.email} disabled helpText="L'adresse e-mail ne peut pas etre modifiee ici." />
        <Input label="Telephone" errorText={errors.phone?.message} {...register('phone')} />

        <div className={styles.row}>
          <Input label="Pays" errorText={errors.country?.message} {...register('country')} />
          <Input label="Ville" errorText={errors.city?.message} {...register('city')} />
        </div>
        <div className={styles.row}>
          <Input label="Adresse" errorText={errors.streetAddress?.message} {...register('streetAddress')} />
          <Input label="Code postal" errorText={errors.postalCode?.message} {...register('postalCode')} />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={updateProfile.isPending}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
