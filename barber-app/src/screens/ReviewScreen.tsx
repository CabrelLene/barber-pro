// src/screens/ReviewScreen.tsx
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { createReview } from '../api/reviews';

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

  const renderRatingButtons = () => {
    return (
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = value === rating;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                selected && styles.ratingButtonSelected,
              ]}
              onPress={() => setRating(value)}
            >
              <Text
                style={[
                  styles.ratingButtonText,
                  selected && styles.ratingButtonTextSelected,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Laisser un avis</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.barberName}>{barberName}</Text>
        <Text style={styles.subtitle}>
          Donne une note et un commentaire pour aider les autres clients.
        </Text>

        <Text style={styles.label}>Ta note</Text>
        {renderRatingButtons()}

        <Text style={styles.label}>Ton commentaire (optionnel)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ex : Super service, très ponctuel..."
          placeholderTextColor="#6b7280"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.submitText}>Envoyer mon avis</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backText: {
    color: '#e5e7eb',
    fontSize: 22,
    marginTop: -3,
  },
  topTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  barberName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 20,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 13,
    color: '#e5e7eb',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  } as any, // React Native ne connait pas encore "gap" en type, mais ça marche en runtime
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  ratingButtonSelected: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  ratingButtonText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  ratingButtonTextSelected: {
    color: '#0f172a',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    fontSize: 14,
    backgroundColor: '#020617',
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#38bdf8',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 15,
  },
});
