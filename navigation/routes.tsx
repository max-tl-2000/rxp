export const appStackBasePath = 'app';

export const appStackPaths: { [key: string]: string } = {
  Home: 'home',
  Messages: 'messages',
  Payments: 'payments',
  Maintenance: 'maintenance',
  Settings: 'settings',
  About: 'about',
  Acknowledgements: 'acknowledgements',
  RegistrationCompleted: 'registrationCompleted',
  PostDetails: 'postDetails',
  Feed: 'feed/:postId?',
};

export const appStackFullPathsMap: { [key: string]: string } = {
  Home: `${appStackBasePath}/${appStackPaths.Home}`,
  Messages: `${appStackBasePath}/${appStackPaths.Messages}`,
  Payments: `${appStackBasePath}/${appStackPaths.Payments}`,
  Maintenance: `${appStackBasePath}/${appStackPaths.Maintenance}`,
  Settings: `${appStackBasePath}/${appStackPaths.Settings}`,
  About: `${appStackBasePath}/${appStackPaths.About}`,
  Acknowledgements: `${appStackBasePath}/${appStackPaths.Acknowledgements}`,
  RegistrationCompleted: `${appStackBasePath}/${appStackPaths.RegistrationCompleted}`,
};

export const authStackBasePath = 'auth';

export const authStackPaths: { [key: string]: string } = {
  SignIn: 'signIn',
  SignInPassword: 'signInPassword',
  FirstTimeUser: 'firstTimeUser',
  ResetLinkSent: 'resetLinkSent',
  CreatePassword: 'registration',
  InvitationLinkExpired: 'invitationLinkExpired',
  ResetPassword: 'resetPassword',
  ResetLinkExpired: 'resetLinkExpired',
  PastResidentLoggedOut: 'pastResidentLoggedOut',
};

export const authStackFullPathsMap: { [key: string]: string } = {
  SignIn: `${authStackBasePath}/${authStackPaths.SignIn}`,
  SignInPassword: `${authStackBasePath}/${authStackPaths.SignInPassword}`,
  FirstTimeUser: `${authStackBasePath}/${authStackPaths.FirstTimeUser}`,
  ResetLinkSent: `${authStackBasePath}/${authStackPaths.ResetLinkSent}`,
  CreatePassword: `${authStackBasePath}/${authStackPaths.CreatePassword}`,
  InvitationLinkExpired: `${authStackBasePath}/${authStackPaths.InvitationLinkExpired}`,
  ResetPassword: `${authStackBasePath}/${authStackPaths.ResetPassword}`,
  ResetLinkExpired: `${authStackBasePath}/${authStackPaths.ResetLinkExpired}`,
  PastResidentLoggedOut: `${authStackBasePath}/${authStackPaths.PastResidentLoggedOut}`,
};

export const notificationStackBasePath = 'notification';

export const notificationStackPaths: { [key: string]: string } = {
  UnsubscribeLink: 'unsubscribe',
};

export const notificationStackFullPathsMap: { [key: string]: string } = {
  UnsubscribeLink: `${notificationStackBasePath}/${notificationStackPaths.UnsubscribeLink}`,
};

export const publicStackBasePath = 'public';

export const publicStackPaths: { [key: string]: string } = {
  PostPreview: 'postPreview',
};
