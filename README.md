# next-brevo-api-helper
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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