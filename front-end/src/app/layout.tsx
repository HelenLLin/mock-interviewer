import '../styles/globals.css';

export const metadata = {
  title: 'Technical Interviewer',
  description: 'An app to help you practice your technical interviews.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="en">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
    </head>
    <body>
      {children}
    </body>
  </html>
)
}