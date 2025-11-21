// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LocationScreen } from '../screens/LocationScreen';
import { BarberDetailsScreen } from '../screens/BarberDetailsScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { BarberBookingsScreen } from '../screens/BarberBookingsScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { useAuth } from '../context/AuthContext';

export type RootStackParamList = {
  // Splash
  Splash: undefined;

  // stack "app"
  Location: undefined;
  BarberDetails: { barberId: string };
  Booking: {
    barberId: string;
    serviceId: string;
    barberName: string;
    serviceName: string;
  };
  MyBookings: undefined;
  BarberBookings: undefined;

  // Paiement d'une réservation
  Payment: {
    bookingId: string;
    amountCents: number;
  };

  // Laisser un avis sur un barber
  Review: {
    barberId: string;
    barberName: string;
  };

  // stack "auth"
  Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        {/* Splash toujours présent en premier */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {user ? (
          <>
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen
              name="BarberDetails"
              component={BarberDetailsScreen}
            />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen
              name="BarberBookings"
              component={BarberBookingsScreen}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
