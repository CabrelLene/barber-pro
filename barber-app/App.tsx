// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  // ⚠️ remplace par ta vraie clé publique Stripe
  const publishableKey = 'pk_test_XXXXpk_test_51SPeFy1Nzi8iTKRgM0DJcsje1UuUQAzEZ3zflLmnKe0LSqxulCWCcxFtRAVs8P5lEFPH0rTeal8yNTu6o4BqBvjv00mqKNRh3G';

  return (
    <AuthProvider>
      <StripeProvider publishableKey={publishableKey}>
        <StatusBar style="light" />
        <RootNavigator />
      </StripeProvider>
    </AuthProvider>
  );
}
