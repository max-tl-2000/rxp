/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/*
{
    "unitsMaintenanceInfo": [
        {
            "inventoryId": "03e055ad-80a2-478e-abcc-9014f34187f0",
            "tickets": [
                {
                    "location": "KITCHEN", // from enum of locations
                    "dateCreated": "2020-05-05T00:00:00-05:00",
                    "dateCompleted": "",
                    "dateCancelled": "",
                    "type": "OTHER",
                    "description": "The AC is not working",
                    "hasPermissionToEnter": true,
                    "hasPets": false,
                    "status": "OPEN", // Enum of possible statuses
                    "attachmentUrls": [
                        // leave empty for this story - see CPM-18202
                    ] // attachmentUrls    
                } // end of first ticket for first unit
            ] // end of tickets for first unit
        }, // end of first unit's info
        {
            "inventoryId": "47442f16-3b51-4f30-89f5-741a675ac189",
            "tickets": [
                {
                    "location": "KITCHEN", // from enum of locations
                    "dateCreated": "2020-05-05T00:00:00-05:00",
                    "dateCompleted": "",
                    "dateCancelled": "",
                    "type": "OTHER",
                    "description": "The AC is not working",
                    "hasPermissionToEnter": true,
                    "hasPets": false,
                    "status": "OPEN",
                    "attachmentUrls": [
                        // leave empty for this story - see CPM-18202
                    ] // attachmentUrls    
                }
            ] // tickets
        } // 2nd unit's info
    ]
} 
*/

export type MaintenanceLocation = {
  code: string;
  name: string;
};

export enum MaintenancePriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Emergency = 'emergency',
}

export type MaintenanceType = {
  type: string;
  integrationId: string;
};

export enum MaintenanceStatus {
  Open = 'open',
  Resolved = 'resolved',
  Cancelled = 'cancelled',
}

export interface AttachmentUrlMetadata {
  'Content-Type': string;
  'reva-userid': string;
  'reva-inventoryid': string;
}

export interface AttachmentUrl {
  metadata: AttachmentUrlMetadata;
  url: string;
}

export interface Ticket {
  inventoryId: string;
  location: string;
  priority: MaintenancePriority;
  dateCreated: string;
  dateCompleted: string;
  dateCancelled: string;
  type: string;
  description: string;
  hasPermissionToEnter: boolean;
  hasPets: boolean;
  status: MaintenanceStatus;
  ticketNumber: number;
  attachmentUrls: AttachmentUrl[];
  phone: string;
}

export interface MaintenanceTicket {
  inventoryId: string;
  tickets: Ticket[];
}

export interface MaintenanceInfo {
  unitsMaintenanceInfo: MaintenanceTicket[];
}
