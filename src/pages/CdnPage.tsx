import { CdnEmbed } from '../components/CdnEmbed';

export default function CdnPage() {
  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>IANBAT - 超难人机验证</title>
      </head>
      <body className="bg-zinc-950 min-h-screen flex items-center justify-center p-4">
        <div id="root" className="w-full max-w-2xl" />
      </body>
    </html>
  );
}

export function CdnPageContent() {
  return (
    <CdnEmbed />
  );
}
