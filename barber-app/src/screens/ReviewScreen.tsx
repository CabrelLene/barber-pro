// src/screens/ReviewScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/RootNavigator';
import { createReview } from '../api/reviews';
import { AppBackground } from '../components/AppBackground';
import { AppButton } from '../components/AppButton';
import { colors, radii, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

export const ReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId, barberName } = route.params;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Note invalide', 'La note doit être entre 1 et 5.');
      return;
    }

    try {
      setLoading(true);
      await createReview({
        barberId,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert(
        'Merci !',
        'Ton avis a bien été enregistré.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: true },
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Erreur',
        "Impossible d'enregistrer ton avis. Vérifie que tu as déjà eu une réservation avec ce barber.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = value <= rating;
          return (
            <TouchableOpacity
              key={value}
              style={styles.starWrapper}
              onPress={() => setRating(value)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={selected ? 'star' : 'star-outline'}
                size={28}
                color={selected ? '#facc15' : '#4b5563'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <AppBackground>
      <View style={styles.root}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>Laisser un avis</Text>
            <Text style={styles.topSubtitle}>
              Étape 3 sur 3 • Avis après ta coupe
            </Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3/3</Text>
          </View>
        </View>

        {/* BARBER CARD */}
        <View style={styles.barberCard}>
          <View style={styles.barberHeaderRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {barberName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.barberName} numberOfLines={1}>
                {barberName}
              </Text>
              <Text style={styles.barberTag} numberOfLines={1}>
                Tu viens de terminer une prestation ? Dis ce que tu en as pensé.
              </Text>
            </View>
          </View>

          <View style={styles.barberMetaRow}>
            <View style={styles.metaChip}>
              <Ionicons
                name="cut-outline"
                size={12}
                color="#e0f2fe"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>Client vérifié</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={12}
                color="#bbf7d0"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>Avis public</Text>
            </View>
          </View>
        </View>

        {/* NOTE SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Ta note globale</Text>
            <Text style={styles.sectionSubtitle}>
              Plus la note est précise, plus tu aides les autres clients.
            </Text>
          </View>
          <View style={styles.sectionIconBadge}>
            <Ionicons name="star-outline" size={16} color="#e5e7eb" />
          </View>
        </View>

        {renderStars()}

        {/* COMMENTAIRE */}
        <View style={styles.commentHeaderRow}>
          <Text style={styles.sectionTitle}>Ton commentaire</Text>
          <Text style={styles.commentOptional}>Optionnel</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Parle du timing, de la qualité de la coupe, de l’ambiance… sois honnête
          et constructif.
        </Text>

        <View style={styles.commentCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Ex : Super service, très ponctuel et coupe nickel. Je recommande ce barber !"
            placeholderTextColor="#6b7280"
            multiline
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* INFO SÉCURITÉ */}
        <View style={styles.infoRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={14}
            color="#6ee7b7"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.infoText}>
            Ton avis est lié à ton compte, mais ton mot de passe reste
            strictement confidentiel.
          </Text>
        </View>

        {/* BOUTON ENVOI */}
        <AppButton
          title="Envoyer mon avis"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />

        <Text style={styles.footerText}>
          Les avis aident les meilleurs barbers à se démarquer. Merci de prendre
          quelques secondes pour partager le tien.
        </Text>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: 24,
  },

  // TOP BAR
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    marginRight: 10,
  },
  topCenter: {
    flex: 1,
  },
  topTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  topSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  stepBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.8)',
  },
  stepBadgeText: {
    fontSize: 11,
    color: '#e0f2fe',
    fontWeight: '600',
  },

  // BARBER CARD
  barberCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
    marginBottom: spacing.lg,
  },
  barberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  barberName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  barberTag: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  barberMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    marginRight: 6,
    marginTop: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: colors.textSubtle,
  },

  // SECTION TITRES
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSubtle,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // STARS
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  starWrapper: {
    padding: 6,
    borderRadius: 999,
  },

  // COMMENTAIRE
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  commentOptional: {
    marginLeft: 8,
    fontSize: 11,
    color: colors.textSubtle,
  },
  commentCard: {
    borderRadius: radii.lg,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.9)',
  },
  textArea: {
    minHeight: 120,
    borderRadius: radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },

  // INFO
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSubtle,
  },

  // SUBMIT
  submitButton: {
    marginTop: spacing.lg,
  },
  footerText: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textSubtle,
  },
});
