/**
 * TypeScript declarations for Brevo (Sendinblue) API v3
 * Compatible with Next.js 15 / TypeScript 5.x
 */

export const BrevoHttpStatus = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
} as const;

export type BrevoStatusCode = keyof typeof BrevoHttpStatus;

export type BrevoStatusMessage = (typeof BrevoHttpStatus)[BrevoStatusCode];

export type BrevoStatus = {
    code: BrevoStatusCode;
    message: BrevoStatusMessage;
};

/////////////////////////////
//  CONTACTS
/////////////////////////////

export interface BrevoContact {
    id?: number;
    email?: string;
    sms?: string;
    attributes?: Record<string, string | number | boolean | (string | number | boolean)[]>;
    listIds?: number[];
    emailBlacklisted?: boolean;
    smsBlacklisted?: boolean;
    updateEnabled?: boolean;
    extId?: string;
    createdAt?: string;
    modifiedAt?: string;
}

/**
 * Request payload when creating a new contact.
 * API: POST /v3/contact
 */
export interface BrevoCreateContactRequest {
    email?: string;
    sms?: string;
    attributes?: Record<string, string | number | boolean | (string | number | boolean)[]>;
    listIds?: number[];
    updateEnabled?: boolean;
    emailBlacklisted?: boolean;
    smsBlacklisted?: boolean;
    extId?: string;
}

/**
 * Response from POST /v3/contact
 */
export interface BrevoCreateContactResponse {
    id: number;
    email?: string;
    sms?: string;
    attributes?: Record<string, string | number | boolean | (string | number | boolean)[]>;
    createdAt: string;
}

/**
 * Response for GET /v3/contact/{identifier}
 */
export interface BrevoGetContactResponse extends BrevoContact {
    listIds: number[];
    statistics?: BrevoContactStats;
}

/**
 * Contact statistics (opens, clicks, etc.)
 */
export interface BrevoContactStats {
    messagesSent?: number;
    delivered?: number;
    opened?: number;
    click?: number;
    hardBounces?: number;
    softBounces?: number;
    complaints?: number;
    unsubscriptions?: number;
    transactionalStats?: {
        delivered?: number;
        opened?: number;
        click?: number;
        softBounces?: number;
        hardBounces?: number;
    };
}

/////////////////////////////
//  ATTRIBUTES
/////////////////////////////

export interface BrevoAttributeCategory {
    name: string;
    attributes: BrevoContactAttributeDefinition[];
}

export interface BrevoContactAttributeDefinition {
    name: string;
    type: "text" | "date" | "float" | "boolean" | "id" | "category" | "multiple_choice";
    value?: string | number | boolean;
    enumeration?: { value: number; label: string }[];
    calculatedValue?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BrevoListAttributesResponse {
    attributes: BrevoContactAttributeDefinition[];
}

/////////////////////////////
//  LISTS
/////////////////////////////

export interface BrevoList {
    id: number;
    name: string;
    totalSubscribers: number;
    uniqueSubscribers: number;
    shared: boolean;
    folderId: number;
    createdAt: string;
    dynamic?: boolean;
}

export interface BrevoGetListsResponse {
    lists: BrevoList[];
    count: number;
}

export interface BrevoGetListContactsResponse {
    contacts: BrevoContact[];
    count: number;
}

export interface BrevoCreateListRequest {
    name: string;
    folderId?: number;
}

export interface BrevoCreateListResponse {
    id: number;
    name: string;
    totalSubscribers: number;
    folderId: number;
    createdAt: string;
}

export interface BrevoUpdateListRequest {
    id: number;
    name: string;
}

export interface BrevoDeleteListRequest {
    id: number;
}

export interface BrevoAddContactsToListBase {
    id: number;
}

export interface BrevoAddContactsToListByEmail extends BrevoAddContactsToListBase {
    emails: string[];
    ids?: never;
    extIds?: never;
}

export interface BrevoAddContactsToListById extends BrevoAddContactsToListBase {
    ids: number[];
    emails?: never;
    extIds?: never;
}

export interface BrevoAddContactsToListByExtId extends BrevoAddContactsToListBase {
    extIds: string[];
    emails?: never;
    ids?: never;
}

export type BrevoAddContactsToListRequest =
    | BrevoAddContactsToListByEmail
    | BrevoAddContactsToListById
    | BrevoAddContactsToListByExtId;

export interface BrevoAddContactsToListResponse {
    contacts: {
        success: number[] | string[],
        failure: number[] | string[],
    };
}

/////////////////////////////
//  FOLDERS
/////////////////////////////

export interface BrevoFolder {
    id: number;
    name: string;
    uniqueSubscribers: number;
}

export interface BrevoGetFoldersResponse {
    folders: BrevoFolder[];
    count: number;
}

export interface BrevoGetFolderRequest {
    id: number;
}

export interface BrevoGetFolderListsResponse {
    lists: BrevoList[];
    count: number;
}

export interface BrevoCreateFolderRequest {
    name: string;
}

export interface BrevoCreateFolderResponse {
    id: number;
}

export interface BrevoUpdateFolderRequest {
    id: number;
    name: string;
}

export interface BrevoDeleteFolderRequest {
    id: number;
}

/////////////////////////////
//  TRANSACTIONAL EMAILS
/////////////////////////////

export interface BrevoEmailRecipient {
    email: string;
    name?: string;
}

export interface BrevoSendEmailRequest {
    sender: BrevoEmailRecipient & { id?: number };
    to: BrevoEmailRecipient[];
    cc?: BrevoEmailRecipient[];
    bcc?: BrevoEmailRecipient[];
    replyTo?: BrevoEmailRecipient;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: number;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    attachment?: {
        url?: string;
        content?: string; // Base64 encoded
        name?: string;
    }[];
    tags?: string[];
}

export interface BrevoSendEmailResponse {
    messageId: string;
}

/////////////////////////////
//  TRANSACTIONAL SMS
/////////////////////////////

export interface BrevoSendSmsRequest {
    sender: string; // must be alphanumeric and <= 11 chars
    recipient: string;
    content: string;
    type?: "transactional" | "marketing";
    tag?: string;
    webUrl?: string;
}

export interface BrevoSendSmsResponse {
    messageId: string;
    reference?: string;
}

/////////////////////////////
//  SMTP / EMAIL EVENT WEBHOOKS
/////////////////////////////

export interface BrevoEmailWebhookEvent {
    event: "delivered" | "opened" | "clicked" | "hardBounce" | "softBounce" | "spam" | "invalidEmail" | "deferred" | "blocked" | "unsubscribed" | "error";
    email: string;
    id: string;
    date: string;
    subject?: string;
    tag?: string;
    messageId?: string;
    reason?: string;
    sendingIp?: string;
    ts?: number;
    ts_event?: number;
}

/////////////////////////////
//  MARKETING CAMPAIGNS (optional)
/////////////////////////////

export interface BrevoCampaign {
    id: number;
    name: string;
    subject: string;
    sender: {
        name: string;
        email: string;
    };
    type: "classic" | "trigger";
    status: "draft" | "sent" | "archive" | "queued" | "suspended" | "inProcess";
    statistics?: {
        delivered?: number;
        opened?: number;
        click?: number;
    };
    createdAt?: string;
    modifiedAt?: string;
}

/////////////////////////////
//  ERROR HANDLING
/////////////////////////////

export interface BrevoApiError {
    code?: string | number;
    message: string;
    status?: number;
    details?: any;
}

/////////////////////////////
//  GENERIC UTILS
/////////////////////////////

export type BrevoApiResponse<T> = {
    data?: T;
    error?: BrevoApiError;
    status: number;
};

