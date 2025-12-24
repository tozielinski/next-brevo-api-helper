# next-brevo-api-helper
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/%40tozielinski%2Fnext-brevo-api-helper)](https://www.npmjs.com/package/@tozielinski/next-upstash-nonce)

## Using the Brevo API for create, update and delete contacts, folders and lists and send mails via the API

# Quick Start
### Install the package:
```bash
npm install @tozielinski/next-brevo-api-helper
```
### Create an API Key in Brevo: and add it to your Next.js environment variables:
```
BREVO_API_KEY=your-brevo-api-key
```
https://www.brevo.com/api-keys
### Create a ServerAction, and use it in your Next.js page:
```tsx
'use server'

import {BrevoClient, BrevoEmailRecipient, BrevoSendEmailRequest} from "@tozielinski/next-brevo-api-helper";

const brevoClient = new BrevoClient();

const mail: BrevoSendEmailRequest = {
    to:
        [{
            email: string
        }]
    ,
    // sender: {
    //     email: string
    // } satisfies BrevoEmailRecipient,
    // cc?: BrevoEmailRecipient[];
    // bcc?: BrevoEmailRecipient[];
    // replyTo?: {
    //     email: string,
    //     name?: string,
    // } satisfies BrevoEmailRecipient,
    // subject: string,
    // htmlContent: string,
    // textContent: "this is a test content for a mail",
    // textContent: mailObject.email + "\n" + (fullName.toString() && "\n") + mailObject.phone + "\nVielen Dank für die Anfrage zum Thema '" + mailObject.topic + "'\n\nDeine Nachricht lautet:\n" + mailObject.message,
    // templateId?: number;
    // params?: Record<string, string | number | boolean>;
    // headers?: Record<string, string>;
    // attachment?: {
    //     url?: string;
    //     content?: string; // Base64 encoded
    //     name?: string;
    // }[];
    // tags?: string[];
};

export async function sendMail() {
    return brevoClient.sendEmail(mail);
}

export async function getFolders(apiKey?:string) {
    const brevoClient = new BrevoClient();
    return brevoClient.getFolders();
}

export async function getFolderDetails(folderId: number, apiKey?:string) {
    const brevoClient = new BrevoClient();
    return brevoClient.getFolderDetails({id: folderId});
}

export async function createFolder(name: string) {
    return brevoClient.createFolder({name: name});
}

export async function deleteFolder(id: number) {
    return brevoClient.deleteFolder({id: id});
}
```
