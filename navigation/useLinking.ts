/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import React from 'react';
import { useLinking as nativeUseLinking, NavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import {
  appStackBasePath,
  appStackPaths,
  authStackBasePath,
  authStackPaths,
  notificationStackBasePath,
  notificationStackPaths,
  publicStackBasePath,
  publicStackPaths,
} from './routes';

export const useLinking = (containerRef: React.MutableRefObject<NavigationContainerRef | undefined>) =>
  nativeUseLinking(containerRef as React.RefObject<NavigationContainerRef>, {
    prefixes: [Linking.makeUrl('/')],
    config: {
      screens: {
        Public: {
          path: publicStackBasePath,
          screens: {
            PostPreview: publicStackPaths.PostPreview,
          },
        },
        Notification: {
          path: notificationStackBasePath,
          screens: {
            UnsubscribeLink: notificationStackPaths.UnsubscribeLink,
          },
        },
        App: {
          path: appStackBasePath,
          screens: {
            Home: {
              path: appStackPaths.Home,
              screens: {
                PostDetails: appStackPaths.PostDetails,
                Feed: appStackPaths.Feed,
              },
            },
            Messages: appStackPaths.Messages,
            Payments: appStackPaths.Payments,
            Maintenance: appStackPaths.Maintenance,
            Settings: appStackPaths.Settings,
            About: appStackPaths.About,
            Acknowledgements: appStackPaths.Acknowledgements,
            RegistrationCompleted: appStackPaths.RegistrationCompleted,
          },
        },
        Auth: {
          path: authStackBasePath,
          screens: {
            SignIn: authStackPaths.SignIn,
            SignInPassword: authStackPaths.SignInPassword,
            FirstTimeUser: authStackPaths.FirstTimeUser,
            ResetLinkSent: authStackPaths.ResetLinkSent,
            CreatePassword: authStackPaths.CreatePassword,
            InvitationLinkExpired: authStackPaths.InvitationLinkExpired,
            ResetPassword: authStackPaths.ResetPassword,
            ResetLinkExpired: authStackPaths.ResetLinkExpired,
            PastResidentLoggedOut: authStackPaths.PastResidentLoggedOut,
          },
        },
      },
    },
  });
