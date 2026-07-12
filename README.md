# EMI Dental Lab — Digital Order Form

Next.js landing page with an interactive dental lab order form. Submissions generate a PDF and email it to the lab (and CC the doctor).

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your Gmail App Password credentials to `.env.local`:

```
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM_NAME=EMI Dental Lab
LAB_EMAIL=hysen.stublla@gmail.com
```

Create an App Password at: Google Account → Security → 2-Step Verification → App passwords.

Without Gmail credentials, development mode still generates the PDF (dry-run).

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build && npm start
```

## Stack

- Next.js App Router + Tailwind CSS
- Interactive FDI tooth chart
- `@react-pdf/renderer` for A4 PDF
- Nodemailer + Gmail App Password for email with PDF attachment
- Zod validation
