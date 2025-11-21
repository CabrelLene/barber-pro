// src/@types/lottie-react-native.d.ts
declare module 'lottie-react-native' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface LottieViewProps extends ViewProps {
    source: any;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    progress?: number;
  }

  export default class LottieView extends Component<LottieViewProps> {}
}
