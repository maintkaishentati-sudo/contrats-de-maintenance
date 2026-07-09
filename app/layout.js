import './globals.css';

export const metadata = {
  title: 'Contrats de maintenance',
  description: 'Suivi des contrats de maintenance et des visites périodiques',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
