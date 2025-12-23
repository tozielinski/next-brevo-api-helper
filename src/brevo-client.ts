import type {
    BrevoApiResponse,
    BrevoApiError,
    BrevoStatus,
    BrevoContact,
    BrevoCreateContactRequest,
    BrevoCreateContactResponse,
    BrevoGetContactResponse,
    BrevoSendEmailRequest,
    BrevoSendEmailResponse,
    BrevoSendSmsRequest,
    BrevoSendSmsResponse,
    BrevoList,
    BrevoCreateListRequest,
    BrevoCreateListResponse,
    BrevoGetListsResponse,
    BrevoGetListContactsResponse,
    BrevoUpdateListRequest,
    BrevoDeleteListRequest,
    BrevoAddContactsToListRequest,
    BrevoAddContactsToListResponse,
    BrevoFolder,
    BrevoCreateFolderRequest,
    BrevoCreateFolderResponse,
    BrevoGetFolderRequest,
    BrevoGetFoldersResponse,
    BrevoGetFolderListsResponse,
    BrevoUpdateFolderRequest,
    BrevoDeleteFolderRequest,
} from "./brevo";

/**
 * Environment-based configuration
 */
const BREVO_BASE_URL = "https://api.brevo.com/v3";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
    console.warn("⚠️ BREVO_API_KEY not set in environment. API calls will fail.");
}

/**
 * Create a fabric for brevoFetch with API key preconfigured
 * @param baseUrl
 * @param apiKey
 */
export function createBrevoFetcher(baseUrl: string, apiKey: string) {
    return async function brevoFetcher<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<BrevoApiResponse<T>> {
        const res = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
                ...options.headers,
            },
        });

        const status = res.status;
        let data = null;

        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (!res.ok) {
            const error: BrevoApiError = {
                status,
                message: data?.message || res.statusText,
                code: data?.code,
                details: data,
            };
            return { status, error };
        }

        return { status, data };
    };
}

/**
 * Minimal helper for making API requests
 */
async function brevoFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<BrevoApiResponse<T>> {
    const res = await fetch(`${BREVO_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY!,
            ...options.headers,
        },
    });

    const status = res.status;
    let data = null;

    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        const error: BrevoApiError = {
            status,
            message: data?.message || res.statusText,
            code: data?.code,
            details: data,
        };
        return { status, error };
    }

    return { status, data };
}

async function fetchAllPaginated<T extends object>(
    endpoint: string,
    responseKey: keyof T,
    limit = 50,
    extraQuery = ""
): Promise<BrevoApiResponse<any>> {
    let offset = 0;
    const allItems: any[] = [];

    let items: any[];

    do {
        const url = `${endpoint}?limit=${limit}&offset=${offset}${extraQuery}`;
        const response = await brevoFetch<T>(url, { method: "GET" });

        if (response.status !== 200) {
            return response; // Fehler durchreichen
        }

        items = (response.data?.[responseKey] as any[]) ?? [];
        allItems.push(...items);

        offset += limit;
    } while (items.length === limit);

    return {
        status: 200,
        data: {
            count: allItems.length,
            [responseKey]: allItems,
        },
    };
}

/**
 * Configuration for BrevoClient, when Toke is not available in environment
 */
export interface BrevoClientConfig {
    apiKey?: string;
    baseUrl?: string;
}

/**
 * BrevoClient – typed wrapper for Brevo REST API v3
 */
export class BrevoClient {
    private brevoFetcher: ReturnType<typeof createBrevoFetcher>;

    // private apiKey: string;

    constructor(
        config?: BrevoClientConfig,
    ) {
        const apiKey = config?.apiKey ?? process.env.BREVO_API_KEY!;
        const baseUrl =
            config?.baseUrl ?? process.env.BREVO_BASE_URL ?? "https://api.brevo.com/v3";
        this.brevoFetcher = createBrevoFetcher(baseUrl, apiKey);
    }
    //
    // ────────────────────────────────
    //  CONTACTS
    // ────────────────────────────────
    //

    /** Create or update a contact */
    async createContact(
        contact: BrevoCreateContactRequest
    ): Promise<BrevoApiResponse<BrevoCreateContactResponse>> {
        return brevoFetch<BrevoCreateContactResponse>("/contacts", {
            method: "POST",
            body: JSON.stringify(contact),
        });
    }

    /** Get contact by email or ID */
    async getContact(
        identifier: string | number
    ): Promise<BrevoApiResponse<BrevoGetContactResponse>> {
        return brevoFetch<BrevoGetContactResponse>(`/contacts/${identifier}`, {
            method: "GET",
        });
    }

    /** Delete a contact */
    async deleteContact(
        identifier: string | number
    ): Promise<BrevoApiResponse<null>> {
        return brevoFetch<null>(`/contacts/${identifier}`, { method: "DELETE" });
    }

    //
    // ────────────────────────────────
    //  LISTS
    // ────────────────────────────────
    //

    /** Get all lists */
    async getLists(): Promise<BrevoApiResponse<BrevoGetListsResponse>> {
        return fetchAllPaginated<BrevoGetListsResponse>(
            "/contacts/lists",
            "lists",
            50,
            "&sort=asc"
        );
    }

    /** Get lists of a folder */
    async getListContacts(listId: number): Promise<BrevoApiResponse<BrevoContact[]>> {
        return fetchAllPaginated<BrevoGetListContactsResponse>(
            `/contacts/folders/${listId}/contacts`,
            "contacts",
            50,
            "&sort=asc"
        );
    }

    /** Get list details */
    async getListDetails(listId: number): Promise<BrevoApiResponse<BrevoList>> {
        return brevoFetch<BrevoList>(`/contacts/lists/${listId}`, {
            method: "GET"
        });
    }

    /** Create a new list */
    async createList(list: BrevoCreateListRequest): Promise<BrevoApiResponse<BrevoCreateListResponse>> {
        return brevoFetch<BrevoCreateListResponse>("/contacts/lists", {
            method: "POST",
            body: JSON.stringify(list),
        });
    }

    async updateList(req: BrevoUpdateListRequest): Promise<BrevoApiResponse<BrevoStatus>> {
        return brevoFetch<BrevoStatus>(`/contacts/lists/${req.id}`, {
            method: "PUT",
            body: JSON.stringify(req.name),
        });
    }

    /** Delete a list */
    async deleteList(req: BrevoDeleteListRequest): Promise<BrevoApiResponse<BrevoStatus>> {
        return brevoFetch<BrevoStatus>(`/contacts/lists/${req.id}`, {
            method: "DELETE"
        });
    }

    /** Add existing contacts to a list */
    async addContactsToList( req: BrevoAddContactsToListRequest): Promise<BrevoApiResponse<BrevoAddContactsToListResponse>> {
        let body: any = {};

        if ("emails" in req) {
            body.emails = req.emails;
        } else if ("ids" in req) {
            body.ids = req.ids;
        } else if ("extIds" in req) {
            body.extIds = req.extIds;
        }

        return brevoFetch<BrevoAddContactsToListResponse>(
            `/contacts/lists/${req.id}/contacts/add`,
            {
                method: "POST",
                body: JSON.stringify(body),
            }
        );
    }

    // async deleteContactFromList(req: BrevoDeleteContactFromListRequest): Promise<BrevoApiResponse<BrevoStatus>> {
    //
    // }

    //
    // ────────────────────────────────
    //  FOLDERS
    // ────────────────────────────────
    //

    /** Get all folders */
    async getFolders(): Promise<BrevoApiResponse<BrevoGetFoldersResponse>> {
        return fetchAllPaginated<BrevoGetFoldersResponse>(
            "/contacts/folders",
            "folders",
            50,
            "&sort=asc"
        );
    }

    /** Get lists of a folder */
    async getFolderLists(req: BrevoGetFolderRequest): Promise<BrevoApiResponse<BrevoList[]>> {
        return fetchAllPaginated<BrevoGetFolderListsResponse>(
            `/contacts/folders/${req.id}/lists`,
            "lists",
            50,
            "&sort=asc"
        );
    }

    /** Get folder details */
    async getFolderDetails(req: BrevoGetFolderRequest): Promise<BrevoApiResponse<BrevoFolder>> {
        return brevoFetch<BrevoFolder>(`/contacts/folders/${req.id}`, {
            method: "GET"
        });
    }

    /** Create a new folder */
    async createFolder(req: BrevoCreateFolderRequest): Promise<BrevoApiResponse<BrevoCreateFolderResponse>> {
        return brevoFetch<BrevoCreateFolderResponse>("/contacts/folders", {
            method: "POST",
            body: JSON.stringify({name: req.name}),
        });
    }

    /** Update a folders name */
    async updateFolder(req: BrevoUpdateFolderRequest): Promise<BrevoApiResponse<BrevoStatus>> {
        return brevoFetch<BrevoStatus>(`/contacts/folders/${req.id}`, {
            method: "PUT",
            body: JSON.stringify({name: req.name}),
        });
    }

    /** Delete a folder and all its lists */
    async deleteFolder(req: BrevoDeleteFolderRequest): Promise<BrevoApiResponse<BrevoStatus>> {
        return brevoFetch<BrevoStatus>(`/contacts/folders/${req.id}`, {
            method: "DELETE"
        });
    }

    //
    // ────────────────────────────────
    //  TRANSACTIONAL EMAILS
    // ────────────────────────────────
    //

    /** Send transactional email */
    async sendEmail(
        email: BrevoSendEmailRequest
    ): Promise<BrevoApiResponse<BrevoSendEmailResponse>> {
        return brevoFetch<BrevoSendEmailResponse>("/smtp/email", {
            method: "POST",
            body: JSON.stringify(email),
        });
    }

    //
    // ────────────────────────────────
    //  TRANSACTIONAL SMS
    // ────────────────────────────────
    //

    /** Send SMS */
    static async sendSms(
        sms: BrevoSendSmsRequest
    ): Promise<BrevoApiResponse<BrevoSendSmsResponse>> {
        return brevoFetch<BrevoSendSmsResponse>("/transactionalSMS/sms", {
            method: "POST",
            body: JSON.stringify(sms),
        });
    }

    //
    // ────────────────────────────────
    //  UTILS
    // ────────────────────────────────
    //

    /** Ping Brevo API (GET /account) */
    static async ping(): Promise<BrevoApiResponse<unknown>> {
        return brevoFetch("/account", { method: "GET" });
    }
}
