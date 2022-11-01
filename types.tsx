import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';

type DrawerParamList = {
  Home: {};
  Messages: {};
  Payments: {};
  Maintenance: {};
  Settings: {};
  About: {};
  Acknowledgements: {};
  RegistrationCompleted: {};
  DeclinedTransactionInfo?: {};
};

type PaymentsParamList = {
  Payments?: {};
  UnitSelector?: {};
  UnitPayments?: {};
  MakePayment?: {};
  ReviewPayment?: {};
  ProcessingPayment?: {};
  PaymentError?: {};
  PaymentHistory?: {};
  SchedulePayment?: {};
  SchedulePaymentError?: {};
  SchedulePaymentInProgress?: {};
  AddPaymentMethod?: {};
  AddPaymentMethodInProgress?: {};
  AddPaymentMethodError?: {};
  ManagePaymentMethods?: {};
  RemovePaymentMethodInProgress?: {};
  RemovePaymentMethodError?: {};
  ManageScheduledPayments?: {};
  MissingPaymentIntegrationError?: {};
};

type HomeParamList = {
  Home: {};
  PostDetails: {} | undefined;
};

type StackParamList = {
  App: {};
  Auth: {};
};

type MaintenanceParamList = {
  Maintenance?: {};
  MaintenanceTicket?: {};
  CreateMaintenanceRequest?: {};
  CreateMaintenanceRequestInProgress?: {};
  CreateMaintenanceRequestFailed?: {};
};

type MessagesDrawerNavProp = DrawerNavigationProp<DrawerParamList, 'Messages'>;
type SettingsDrawerNavProp = DrawerNavigationProp<DrawerParamList, 'Settings'>;
type AboutDrawerNavProp = DrawerNavigationProp<DrawerParamList, 'About'>;
type RegistrationCompletedDrawerNavProp = DrawerNavigationProp<DrawerParamList, 'RegistrationCompleted'>;
type StackNavProp = StackNavigationProp<StackParamList>;

export type CustomDrawerNavigationProp = DrawerNavigationProp<DrawerParamList>;

export type HomeScreenNavigationProp = StackNavigationProp<HomeParamList, 'Home'>;
export type MessagesScreenNavigationProp = CompositeNavigationProp<MessagesDrawerNavProp, StackNavProp>;
export type PaymentsScreenNavigationProp = StackNavigationProp<PaymentsParamList, 'Payments'>;
export type MaintenanceScreenNavigationProp = StackNavigationProp<MaintenanceParamList, 'Maintenance'>;
export type SettingsScreenNavigationProp = CompositeNavigationProp<SettingsDrawerNavProp, StackNavProp>;
export type AboutScreenNavigationProp = CompositeNavigationProp<AboutDrawerNavProp, StackNavProp>;
export type PaymentHistoryScreenNavigationProp = StackNavigationProp<PaymentsParamList, 'PaymentHistory'>;
export type AcknowledgementsScreenNavigationProp = StackNavigationProp<DrawerParamList, 'Acknowledgements'>;
export type RegistrationCompletedScreenNavigationProp = CompositeNavigationProp<
  RegistrationCompletedDrawerNavProp,
  StackNavProp
>;

type AuthParamList = {
  SignIn: {};
  SignInPassword: {};
  FirstTimeUser: {};
  ResetLinkSent: {};
  RegistrationCompleted: {};
  ResetPassword: {};
  App: {};
  ResetLinkExpired: {};
  PastResidentLoggedOut: {};
};

export type SignInScreenNavigationProp = StackNavigationProp<AuthParamList, 'SignIn'>;
export type ResetLinkSentScreenNavigationProp = StackNavigationProp<AuthParamList, 'ResetLinkSent'>;
export type ResetLinkSentScreenRouteProp = RouteProp<AuthParamList, 'ResetLinkSent'>;
export type SignInPasswordScreenNavigationProp = StackNavigationProp<AuthParamList, 'SignInPassword'>;
export type SignInPasswordScreenRouteProp = RouteProp<AuthParamList, 'SignInPassword'>;
export type FirstTimeUserScreenNavigationProp = StackNavigationProp<AuthParamList, 'FirstTimeUser'>;
export type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthParamList, 'ResetPassword'>;
export type ResetLinkExpiredScreenNavigationProp = StackNavigationProp<AuthParamList, 'ResetLinkExpired'>;
export type PastResidentLoggedOutScreenNavigationProp = StackNavigationProp<AuthParamList, 'PastResidentLoggedOut'>;

export type RootParamList = StackParamList &
  AuthParamList &
  DrawerParamList &
  HomeParamList &
  PaymentsParamList &
  MaintenanceParamList;

export type TenantSettingsLegal = {
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
};

export type Post = {
  id: string;
  title: string;
  heroImageURL: string;
  message: string;
  messageDetails: string;
  createdBy: string;
  sentAt: string;
};
