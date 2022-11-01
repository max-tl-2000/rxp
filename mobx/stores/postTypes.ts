/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export enum PostCategory {
  Announcement = 'announcement',
  AnnouncementAutomated = 'announcement (automated)',
  Emergency = 'emergency',
}

export enum PostSubCategory {
  GeneralAnnouncement = 'generalAnnouncement',
}

interface RetractDetails {
  retractedReason?: string;
  retractedBy?: string;
}

interface PostMetadata {
  retractDetails?: RetractDetails;
}

export interface Post {
  id: string;
  category: PostCategory;
  subCategory: PostSubCategory;
  title: string;
  message: string;
  sentAt: string;
  createdBy: string;
  retractedAt: string;
  unread: boolean;
  propertyId?: string;
  messageDetails?: string;
  publicDocumentId: string;
  heroImageURL?: string;
  hasMessageDetails?: boolean;
  metadata?: PostMetadata;
  isDefaultPost?: boolean;
}
