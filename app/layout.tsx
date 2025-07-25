import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/ui/notification";
import { UserProvider } from "@/contexts/UserContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundHex - Music Platform",
  description: "Discover, stream, and upload music for free on SoundHex",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/favicon.ico?v=4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="icon"
          href="/favicon.ico?v=4"
          type="image/x-icon"
          sizes="48x48"
        />
        {/* <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" /> */}
      </head>
      <body
        className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`}
        style={{ backgroundColor: "hsl(220 15% 12%)", color: "hsl(0 0% 85%)" }}
      >
        <UserProvider>
          <AudioPlayerProvider>
            {children}
            <NotificationProvider />
          </AudioPlayerProvider>
        </UserProvider>
      </body>
    </html>
  );
}
```

```text
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/ui/notification";
import { UserProvider } from "@/contexts/UserContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext"; //Import PlaylistProvider
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundHex - Music Platform",
  description: "Discover, stream, and upload music for free on SoundHex",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/favicon.ico?v=4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="icon"
          href="/favicon.ico?v=4"
          type="image/x-icon"
          sizes="48x48"
        />
        {/* <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" /> */}
      </head>
      <body
        className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`}
        style={{ backgroundColor: "hsl(220 15% 12%)", color: "hsl(0 0% 85%)" }}
      >
        <UserProvider>
          <AudioPlayerProvider>
            <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
          </AudioPlayerProvider>
        </UserProvider>
      </body>
    </html>
  );
}
```

```text
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/ui/notification";
import { UserProvider } from "@/contexts/UserContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext"; //Import PlaylistProvider
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundHex - Music Platform",
  description: "Discover, stream, and upload music for free on SoundHex",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/favicon.ico?v=4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="icon"
          href="/favicon.ico?v=4"
          type="image/x-icon"
          sizes="48x48"
        />
        {/* <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" /> */}
      </head>
      <body
        className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`}
        style={{ backgroundColor: "hsl(220 15% 12%)", color: "hsl(0 0% 85%)" }}
      >
        <UserProvider>
          <AudioPlayerProvider>
            <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
          </AudioPlayerProvider>
        </UserProvider>
      </body>
    </html>
  );
}
```

```
// Import PlaylistProvider
```

```
<PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
import { PlaylistProvider } from "@/contexts/PlaylistContext";
```

```
 <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
 <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
import { PlaylistProvider } from "@/contexts/PlaylistContext";
```

```
<PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
<PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
import { PlaylistProvider } from "@/contexts/PlaylistContext";
```

```
  <PlaylistProvider>
```

```
 </PlaylistProvider>
```

```
<PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
import { PlaylistProvider } from "@/contexts/PlaylistContext";
```

```
      <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
<PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
import { PlaylistProvider } from "@/contexts/PlaylistContext";
```

```
      <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```

```
        <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
```
The code is modified to include the PlaylistProvider to manage the global playlist state.
```text
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/components/ui/notification";
import { UserProvider } from "@/contexts/UserContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext"; //Import PlaylistProvider
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoundHex - Music Platform",
  description: "Discover, stream, and upload music for free on SoundHex",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon.svg?v=4", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/favicon.ico?v=4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="icon"
          href="/favicon.ico?v=4"
          type="image/x-icon"
          sizes="48x48"
        />
        {/* <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" /> */}
      </head>
      <body
        className={`${inter.className} dark:bg-background dark:text-foreground bg-background text-foreground`}
        style={{ backgroundColor: "hsl(220 15% 12%)", color: "hsl(0 0% 85%)" }}
      >
        <UserProvider>
          <AudioPlayerProvider>
            <PlaylistProvider>
              {children}
              <NotificationProvider />
            </PlaylistProvider>
          </AudioPlayerProvider>
        </UserProvider>
      </body>
    </html>
  );
}