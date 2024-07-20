'use client'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { zkSyncSepoliaTestnet } from 'wagmi/chains';
export const config = getDefaultConfig({
    appName: 'RainbowKit demo',
    projectId: 'YOUR_PROJECT_ID',
    chains: [zkSyncSepoliaTestnet],
    ssr: true,
  });

import abi from './config-abi';
export const contractConfig = {
  address: '0x97F758Ef7A433AbCc4D2455bAC7F115e396a9273',
  abi,
} as const;