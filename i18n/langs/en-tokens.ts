/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const translations = {
  LOGINFLOW_LINE_1: 'Resident Experience',
  LOGINFLOW_LINE_2: 'Reva Real Estate',
  LOGINFLOW_LINE_3: 'We design the communities of tomorrow',

  SIGN_IN: 'Sign in',
  CONTINUE: 'Continue',
  SIGNING_IN_PROGRESS: 'Signing in...',
  ENTER_YOUR_EMAIL: 'Enter your email address',
  THE_EMAIL_IS_REQUIRED: 'The email address is required',
  ENTER_A_VALID_EMAIL: 'Enter a valid email address',
  THE_PASSWORD_IS_REQUIRED: 'The password is required',
  HI_THERE: `Hi there,\n{{email}}`,
  WRONG_PASSWORD_MESSAGE: 'Oops, your email and password do not match our records. Try again or reset your password',
  FORGOT_YOU_PASSWORD_HELPER: 'Forgot your password? No problem!',
  FORGOT_YOU_PASSWORD_LINK: 'Just click here to reset it!',
  NOT_REGISTERED_HELPER: 'Not registered yet?',
  NOT_REGISTERED_LINK: 'Click here and we’ll help you get started!',
  BLOCKED_ACCOUNT_MESSAGE: `You’ve attempted to login with a bad password more than 5 times. We’ve blocked your account for 10 minutes.`,
  TRY_AGAIN: 'TRY AGAIN',
  FIRST_TIME_USER_MESSAGE: `If you’ve completed a registration in order to submit your rental application, you can use the same email address and password to access {{appName}} \n\nTo register, you need to have an invitation sent to you by one of our leasing agents. Please contact your agent and ask for an invitation, so you can register a new account.`,
  GOT_IT: 'GOT IT!',
  RESET_LINK_SENT_MESSAGE: `You will receive an email shortly. Please follow the instructions in that email to finish resetting your password.`,
  OPEN_EMAIL_APP: 'OPEN EMAIL APP',
  CREATE_ACCOUNT: 'Create Account',
  INVITED_USER_NAME: 'Invited user name',
  PASSWORD: 'Password',
  CREATE_ACCOUNT_AGREEMENTS: `By clicking "CREATE ACCOUNT", I agree to APP's`,
  AND: 'and',
  TERMS_OF_SERVICE: 'Terms of service',
  PRIVACY_POLICY: 'Privacy policy',
  PASSWORD_MIN_CHARACTERS: 'The password must have at least 8 characters',
  CREATE_ACCOUNT_IN_PROGRESS: 'Creating account...',
  SORRY_INVITATION_HAS_EXPIRED: 'Sorry!\nThis invitation has expired.',
  INVITATION_HAS_EXPIRED_INSTRUCTIONS: `To register, you need to have a new invitation sent to\nyou by one of our leasing agents. Please contact\n your agent and ask for an invitation, so you can register a new account.`,
  OFFLINE_TITLE: `You’re currently offline!`,
  OFFLINE_SUBTITLE: `You can continue to use the application once you have an internet connection.`,
  HOME: 'Home Feed',
  HOME_EMPTY_STATE_TEXT:
    'Use the hamburger icon on the top left corner to check your balance, make a payment, create maintenance orders as well as message your property.',
  MESSAGES_EMPTY_STATE_TEXT:
    'No need to look for stamps and envelopes.\n\nYou can send a direct message to your property office from here.\nIt’s a quick and convenient way to contact the property agents, and you’ll be notified of any response immediately.',
  POST_EMPTY_STATE_TITLE: 'Welcome aboard!',
  POST_EMPTY_STATE_MESSAGE: `This is your home feed. It shows all of the content published by your property. This ranges from announcements about various news or events all the way to emergency messages in case of urgent information you need to be aware of.`,
  TAKE_ME_THERE: 'Take me there',
  ACCOUNT_CREATED_MESSAGE: 'Congratulations, your account has been created!',
  START_USING_APP_MESSAGE: 'You can now start using {{appName}}.',
  RESET_PASSWORD: 'Reset password',
  ENTER_NEW_PASSWORD: 'Enter your new password',
  YOUR_USER_NAME: 'Your user name',
  FINISH_RESET_PASSWORD_MESSAGE: 'Finish resetting your password',
  NO_LONGER_HAVE_ACCESS: 'Sorry you no longer have access to that property',
  RESET_LINK_EXPIRED: 'Reset link expired',
  DUE_IN_DAYS_DATE: 'due in {{days}} days, {{date}}',
  BALANCE_DUE_BY_DATE: '{{balance}} due on {{date}}',
  OVERDUE_BY_DATE: '{{balance}} was due by {{date}}',
  DUE_IN_DAYS: 'Due in {{days}} days',
  OVERDUE_BY_DAYS: 'Overdue by {{days}} days',
  YOUR_CURRENT_BALANCE_IS_DUE: 'Your current balance is due',
  IN_DAYS_DATE: 'in {{days}} days',
  YOUR_CURRENT_BALANCE_IS_OVERDUE: 'Your current balance is overdue',
  SINCE_DATE: 'since {{date}}',
  DAYS_AGO: '{{days}} days ago',
  YOUR_CURRENT_BALANCE_WAS_DUE: 'Your current balance was due',
  YOUR_ALL_SET: 'You’re all set!\nNo charges due at this time.',
  SOMETHING_WENT_WRONG: 'Something went wrong!',
  UNABLE_TO_SHOW_PAYMENT_DATA:
    'We are unable to show your payment data. An automated system alert has been created for this issue and will be looked at shortly.',
  RETRY_OR_CONTACT_PROPERTY: 'Try again in some time or contact your property',
  MAKE_A_PAYMENT: 'Make a payment',
  I_WOULD_LIKE_TO_PAY: 'I would like to pay',
  MY_BALANCE_VALUE: 'My balance  {{balance}}',
  FIXED_AMOUNT: 'Fixed amount',
  YOUR_BALANCE_AT_UNIT: 'Your balance at {{unitName}}',
  OVERDUE_SINCE_YESTERDAY: 'Overdue since yesterday',
  DUE_TODAY: 'Due today',
  DUE_TOMORROW: 'Due tomorrow',
  PAYMENT_METHOD: 'Payment method',
  CHANGE_METHOD: 'Change method',
  ADD_PAYMENT_METHOD: 'Add payment method',
  MANAGE_PAYMENT_METHODS: 'Manage payment methods',
  DEFAULT_METHOD: 'Default method',
  MAKE_DEFAULT: 'Make default',
  KEEP_DEFAULT: 'Keep existing',
  MAKE_DEFAULT_PAYMENT_TITLE: 'Update default method',
  MAKE_DEFAULT_PAYMENT_BODY: 'Would you like to make {{payment}} your new default payment method?',
  DEFAULT_METHOD_UPDATED_TITLE: 'Default method updated',
  DEFAULT_METHOD_UPDATED_BODY: '{{payment}} was set as your default payment method',
  REMOVE: 'Remove',
  REMOVE_PAYMENT_TITLE: 'Remove {{payment}}',
  REMOVE_PAYMENT_BODY: 'Are you sure you want to remove this payment method from your account?',
  PAYMENT_AMOUNT_WARNING: 'Amount must be between $1 and {{balance}}',
  NO_PAYMENT_METHOD_MSG: 'You need to add a method to make a payment.',
  DEFAULT_PAYMENT_EXPIRED_TITLE: 'Default method expired',
  DEFAULT_PAYMENT_EXPIRED:
    'Your previous default payment method, {{payment}} expired on {{expirationDate}}. Your current default is {{newPayment}}. \n\nYou can change your default method at any time by going to Manage payment methods.',
  CHANGE_DEFAULT: 'Change default',
  OK_GOT_IT: 'Ok, got it',
  I_UNDERSTAND: 'I understand',
  PAY_NOW: 'PAY NOW',
  SHOW_DETAILS: 'SHOW DETAILS',
  HIDE_DETAILS: 'HIDE DETAILS',
  DUE_BY_DATE: 'Due by {{date}}',
  UNITS_RENTED: 'Units Rented',
  AUTOMATED_POST: 'Automated post',
  SAVE: 'Save',
  REVIEW_PAYMENT: 'Review payment',
  CONFIRM_PAYMENT: 'Confirm payment',
  CANNOT_PROCESS_PAYMENTS_TITLE: 'Cannot process payments',
  CANNOT_PROCESS_PAYMENTS_BODY:
    'This account has been blocked from making any new payments. Contact your property for details or to get this status corrected.',
  ACCOUNT_BLOCKED:
    'This account has been blocked from making any new payments. Contact your property for details or to get this status updated.',
  SUMMARY: 'Summary',
  PAYMENT_AMOUNT: 'Payment Amount',
  ADDITIONAL_FEES: 'Additional Fees',
  TOTAL: 'Total',
  THIS_IS_A_SECURE_PAYMENT: 'This is a secure payment',
  PROCESSING_PAYMENT: 'Processing payment',
  PLEASE_WAIT_WHILE_YOUR_PAYMENT_IS_BEING_PROCESSED: 'Please wait while your payment is being processed.',
  PLEASE_WAIT_WHILE_YOUR_PAYMENT_IS_BEING_SCHEDULED: 'Please wait while your payment is being scheduled.',
  PLEASE_WAIT_WHILE_YOUR_PAYMENT_METHOD_IS_BEING_REMOVED: 'Please wait while your payment method is being removed.',
  REMOVING_PAYMENT_METHOD: 'Removing payment method',
  ERROR_REMOVING_METHOD: 'Error removing method',
  ERROR_REMOVING_METHOD_MESSAGE:
    'Try removing your payment method again. Contact your property if the problem persists.',
  CREDIT_CARD_REMOVED_SUCCESSFULLY: 'Credit card #{{cardLastDigits}} was removed from your account.',
  PAYMENT_METHOD_EXPIRED: 'Payment method has expired.\nTry again with a different payment method.',
  EXPIRED: 'Expired',
  PAYMENT_PROCESSING_FAILED: 'Payment failed to process.\nTry again with a different payment method.',
  PAYMENT_COMPLETED: 'Payment completed',
  PAYMENT_SUCCESSFUL: 'Payment successful',
  ERROR_PROCESSING_PAYMENT: 'Error processing payment',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  ACH_ACCOUNT: 'ACH Account',
  ACH: 'ACH',
  SERVICE_FEE: 'Service fee',
  EXPIRATION_DATE: 'Exp',
  FEE: 'Fee',
  IS_LOWER_FEE_AVAILABLE_MSG: 'You have methods with a lower service fee.',
  DATE_TODAY: 'Today',
  DATE_TOMORROW: 'Tomorrow',
  ANNOUNCEMENT_DETAILS: 'Announcement Details',
  EMERGENCY_DETAILS: 'Emergency Details',
  DATE_TIME: 'date/time: {{date}}',
  CAUGHT_UP_ANNOUNCEMENTS: 'You are all caught up!',
  OLDER_POSTS_BELOW: 'View older posts below.',
  READ_MORE: 'Read more',
  POSTED_BY: 'posted by {{createdBy}}',
  RETRACTED: 'Retracted',
  INACCURATE_OR_MISLEADING_INFORMATION: 'Inaccurate or misleading information',
  NO_LONGER_APPLICABLE_OR_VALID: 'No longer applicable or valid',
  MISSING_OR_INCOMPLETE_INFORMATION: 'Missing or incomplete information',
  SENT_TO_THE_WRONG_GROUP_OF_PEOPLE: 'Sent to the wrong group of people',
  CREATE_REQUEST: 'Create request',
  UNIT: 'Unit',
  LOCATION: 'Location',
  DESCRIPTION: 'Description',
  DATE_SUBMITTED: 'Date submitted',
  MAINTENANCE_TYPE: 'Maintenance Type',
  CALLBACK_PHONE_NUMBER: 'Callback phone number',
  CALLBACK_PHONE: 'Callback phone',
  DESCRIBE_YOUR_ISSUE: 'Describe your issue',
  PRIORITY: 'Priority',
  ADD_PHOTOS_OPTIONAL: 'Add photos (optional)',
  ADD_PHOTO: 'Add photo',
  YES: 'Yes',
  NO: 'No',
  PERMISSION_TO_ENTER: 'Permission to enter?',
  PETS_ON_PREMISES: 'Pets on premises?',
  SUBMIT: 'Submit',
  PLEASE_SELECT_A_UNIT: 'Please select a unit',
  PLEASE_SELECT_A_LOCATION: 'Please select a location',
  PLEASE_SELECT_A_MAINTENANCE_TYPE: 'Please select the maintenance type',
  PLEASE_PROVIDE_PHONE_NUMBER: 'Please provide a valid callback phone number',
  PLEASE_PROVIDE_A_DESCRIPTION: 'Please provide a description of your issue',
  MAX_LIMIT_PHOTO_WARNING_TEXT: 'You cannot attach more than 10 photos.',
  REQUEST: 'Request',
  KITCHEN: 'Kitchen',
  LIVING_ROOM: 'Living Room',
  BATHROOM: 'Bathroom',
  BEDROOM: 'Bedroom',
  OUTSIDE: 'Outside',
  OTHER: 'Other',
  ELECTRICAL: 'Electrical',
  HVAC: 'HVAC',
  MAINTENANCE: 'Maintenance',
  PLUMBING: 'Plumbing',
  SERVICE: 'Service',
  OPEN: 'Open',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency',
  STATUS: 'Status',
  SORRY: 'Sorry!',
  CANNOT_USE_MAINTENANCE: 'You can’t use maintenance just yet',
  UNAVAILABLE_PAST_TRANSACTIONS: 'Your past transactions will be available here for review.',
  PAYMENT_HISTORY: 'Payment history',
  PAYMENTS_HISTORY_TITLE: 'History - {{unit}}',
  PAYMENT_HISTORY_MSG: '{{method}} payment',
  DECLINE_HISTORY_MSG: 'Declined {{method}} payment',
  REFUND_HISTORY_MSG: 'Refund of {{method}} payment',
  REVERSAL_HISTORY_MSG: 'Reversal of {{method}} payment',
  VOID_HISTORY_MSG: 'Void of {{method}} payment',
  SHOW_FULL_HISTORY: 'SHOW FULL HISTORY',
  DATE: 'Date',
  AMOUNT: 'Amount',
  PAYMENT: 'Payment',
  REFUND: 'Refund',
  REVERSAL: 'Reversal',
  DECLINED_PAYMENT: 'Declined Payment',
  VOIDED_PAYMENT: 'Voided Payment',
  REVERSAL_FEE: 'Reversal Fee',
  REFERENCE_NUMBER: 'Reference Number',
  PAYMENT_REFERENCE_NUMBER: 'Payment Reference Number',
  DECLINE_REASON: 'Decline Reason',
  REFUND_REASON: 'Refund Reason',
  VOID_REASON: 'Void Reason',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  DUPLICATE_PAYMENT: 'Duplicate payment',
  CHARGED_BACK_PAYMENT: 'The payment was charged back',
  ACKNOWLEDGEMENT_MESSAGE: `The following sets forth attribution notices for third party software that may be contained in portions of this application. We thank the open source community for all of their contributions.`,
  COPYRIGHT: 'Reva Technology © {{year}}',
  ERROR_ADDING_METHOD: 'Error adding method',
  NO_SCHEDULED_PAYMENTS: 'You don’t have any scheduled payments.\nUse the action below to add one now.',
  NO_PAYMENT_METHODS: 'You don’t have any payment methods yet.\nUse the action below to add one now.',
  NO_PAYMENT_METHODS_NOTE: 'NOTE:\nYou cannot make payments until you add at least one method. ',
  NO_VALID_PAYMENT_METHODS: 'You don’t have any valid payment methods.\nUse the action below to add one now.',
  NO_VALID_PAYMENT_METHODS_NOTE: 'NOTE:\nYou cannot make payments until you add at least one valid method.',
  NO_VALID_CARD_PAYMENT_METHODS_NOTE:
    'NOTE:\nYou are currently limited to use credit or debit cards only. You cannot make payments until you add at least one valid method.',
  ONLY_CARDS_ALLOWED: 'You are currently only allowed to use credit or debit cards for payments',
  ADDING_PAYMENT_METHOD: 'Adding payment method',
  ADDING_PAYMENT_METHOD_MSG: 'Please wait while your payment method is being added.',
  UNSUBSCRIBE_FROM_EMAILS: 'Unsubscribe from emails',
  UNSUBSCRIBE_FROM: 'Are you sure you want to unsubscribe from {{commsSubcategory}} emails?',
  UNSUBSCRIBE_CONFIRMATION_BUTTON: 'Yes, unsubscribe',
  YOU_HAVE_UNSUBSCRIBED: "You've unsubscribed",
  YOU_WILL_NO_LONGER_RECEIVE_EMAILS:
    'You will no longer receive {{commsSubcategory}} emails from {{propertyDisplayName}}.',
  IT_CAN_TAKE_5_DAYS: 'It can take up to 5 business days for this to go into effect. Thanks for being patient.',
  UNSUBSCRIPTION_NOTE:
    'Note that you will continue receiving emails notifications for business-essential messages from your property.',
  CLOSE_WINDOW: 'You may now close this window',
  ANNOUNCEMENT: 'Announcement',
  DIRECT_MESSAGE: 'Direct message',
  APP_TITLE: 'Reva Property Manager',
  NOT_FOUND_PAGE_TITLE: 'Looks like you got lost',
  NOT_FOUND_PAGE_CONTACT_US_AT: 'If you know the property, contact an agent for help, or contact us at',
  NO_MAINTENANCE_DATA_LINE1: 'You don’t have any maintenance requests.',
  NO_MAINTENANCE_DATA_LINE2: 'Use the action below to create one.',
  CREATING_REQUEST: 'Creating request',
  CREATING_REQUEST_MSG: 'Please wait while your maintenance request is being created.',
  ERROR_CREATING_REQUEST: 'Error creating request',
  ERROR_CREATING_REQUEST_MSG: 'Try again, and contact your property if the problem persists.',
  CAMERA_PERMISSION_REQUIRED: 'Camera permission needed to attach photos to maintenance requests.',
  CAMERA_ROLL_PERMISSION_REQUIRED: 'Image gallery permission needed attach photos to maintenance requests.',
  TAKE_A_PHOTO: 'Take a photo',
  CHOOSE_FROM_GALLERY: 'Choose from gallery',
  SCHEDULED_PAYMENTS: 'Scheduled payments',
  MANAGE_SCHEDULED_PAYMENTS: 'Manage scheduled payments',
  SCHEDULE_A_PAYMENT: 'Schedule a payment',
  NO_SCHEDULED_PAYMENTS_MSG: 'You don’t have any payments scheduled',
  PAYMENTS_TAKE_TIME_TO_REFLECT_BALANCE: 'Payments take up to 24 hours to reflect in your balance.',
  LAST_MONTH: 'Last month',
  WITHOUT_END_DATE: 'Without end date',
  METHOD: 'Method',
  ERROR_LOADING_MAINTENANCE: 'Error loading maintenance',
  FIRST_DAY: 'First day',
  LAST_DAY: 'Last day',
  OF_THE_MONTH: 'of the month',
  DAY_OF_THE_MONTH: 'Day {{dayOfMonth}} of the month',
  NEXT_SCHEDULED_PAYMENT: 'Next scheduled payment',
  VERSION: 'Version',
  BUILD_VERSION: 'Build Version',
  UPDATED_ID: 'Updated Id',
  ACKNOWLEDGMENTS: 'Acknowledgments',
  ABOUT: 'About',
  SCHEDULING_PAYMENT: 'Scheduling payment',
  GENERIC_ERROR_MESSAGE: 'Please try again, and if the problem persists contact your property.',
  ERROR_SCHEDULING_PAYMENT: 'Error scheduling payment',
  PAYMENT_SCHEDULED_SUCCESSFULLY: 'Your payment was scheduled successfully',
  PAYMENTS: 'Payments',
  SCHEDULES: 'Schedules',
  REMOVE_SCHEDULED_PAYMENT: 'Remove scheduled payment',
  REMOVE_SCHEDULED_PAYMENT_MSG: 'Are you sure you want to remove this scheduled payment?',
  YES_REMOVE: 'Yes, remove',
  CANCEL: 'Cancel',
  CANNOT_USE_PAYMENT: 'You can’t use payment just yet',
  NO_PAYMENT_DATA: 'We do not have any payment data for your account.',
  NO_MAINTENANCE_DATA: 'We do not have any maintenance data for your account.',
  THIS_MAY_HAPPEND:
    'This may happen if -\n - Your account was created recently\n - Your Lease has not started\n - Your lease has already ended',
  RETRY_LATER_OR_CONTACT_PROPERTY_MAINTENANCE: 'Try again later or contact your property.',
  SCHEDULED_PAYMENT_PROCESSED_SUCCESSFULLY: 'Your scheduled payment was processed successfully.',
  SCHEDULED_PAYMENT_DECLINE_MESSAGE: 'Your scheduled payment for {{date}} for {{unitName}} failed. {{reason}}',
  REASON: 'Reason: {{reason}}.',
  LEARN_MORE: 'LEARN MORE',
  DISMISS: 'DISMISS',
  PAYMENTS_UNIT: 'Payments - {{unitName}}',
  SETTLE_YOUR_BALANCE: 'Make sure you settle your balance',
  MAKE_ONE_TIME_PAYMENT_FOR_DECLINED_SCHEDULED:
    'When a scheduled payment is declined you will need to perform a regular one time payment to make sure your balance is settled, and you avoid any applicable late payment fees. You can do so now by using the below action.',
  REVIEW_SCHEDULED_PAYMENTS: 'Review your scheduled payments',
  REVIEW_SCHEDULED_PAYMENTS_RECOMMENDATION:
    'Declined scheduled payments incur a penalty. We recommend that you review your scheduled payments and make sure they are set up correctly.',
  SHOW_SCHEDULED_PAYMENTS: 'SHOW SCHEDULED PAYMENTS',
  MESSAGE: 'Message',
  SEARCH: 'Search',
  UNKNOWN_BROWSER_WEB_MESSAGE:
    'The browser you are using may not be optimized for {{appName}}. You can view our recommended browser list by ',
  UNKNOWN_BROWSER_CLICKING_HERE: 'clicking here.',
  UNKNOWN_BROWSER_MOBILE_WEB_NOT_SUPPORTED: 'This browser is not supported. ',
  UNKNOWN_BROWSER_MOBILE_WEB_RECOMMENDED: ' for our recommended browser list.',
  CLICK_HERE: 'Click here',
  HELP_WITH_FAILED_PAYMENTS: 'Help with failed payments',
  REVISIT_INFO:
    'You can revisit this page anytime by choosing ‘Help with failed payments’ from the menu on your payments screen.',
  PAYMENT_UPPER_LIMIT_MESSAGE: '* upper limit for a single payment',
  NO_PAYMENT_INFORMATION_YET: 'No payment information yet',
  NO_CHARGES_DUE_AT_THIS_TIME: 'No charges due at this time',
  CANT_USE_PAYMENTS_JUST_YET: `Sorry!
You can’t use payments just yet`,
  NO_PAYMENT_DATA_WITH_DETAILS: `We do not have any payment data for your account.
This may happen if -
- Your account was created recently
- Your lease has not started
- Your lease has already ended
Try again later or contact your property.`,
  CANNOT_PERFORM_PAYMENT: 'Cannot perform payment',
  NO_LONGER_LEASING_THIS_UNIT:
    'You are no longer leasing this unit. You can access your history but cannot perform any payment transactions or schedule payments.',
  CANNOT_ADD_PAYMENT_METHOD: 'Cannot add payment method',
  NO_LONGER_LEASING_THIS_UNIT_PMT_METHOD:
    'You are no longer leasing this unit. You can view and remove existing methods but cannot add any new payment methods.',
  CANNOT_CREATE_REQUEST: 'Cannot create request',
  CANNOT_CREATE_REQUEST_MSG:
    'You are no longer leasing any unit. You can view your maintenance history but cannot create any new maintenance requests.',
  THE_LATEST_UPDATE_WAS_SUCCESSFULLY_APPLIED: 'The latest update was successfully applied.',
  UNABLE_TO_SHOW_POST_DATA:
    'We are unable to show the {{categoryDetails}}. An automated system alert has been created for this issue and will be looked at shortly.',
  POST_PREVIEW_MESSAGE_CARD: 'Message as it will appear on the feed',
  POST_PREVIEW_MESSAGE_FULL: 'Message details as it will appear when opened',
  POST_PREVIEW_LOADING_MESSAGE: 'Loading preview...',
  SYSTEM_ERROR: 'System error. Try reopening the app.',
  PAYMENT_LOADING_MSG: 'Please wait while we load your payment information.',
  PAST_RESIDENT_LOGGED_OUT_MSG: `You cannot access {{appName}} because you are registered as a past resident with this email. Here are some tips- \n
If you are in the process of signing a new lease, then you will be able to log in with your existing account once your lease has been signed.
If you used a different email to register then try logging in using that email.\n
Contact your property for any further information.
  `,
};
