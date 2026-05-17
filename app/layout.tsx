export const metadata = { title: 'Assignment Assistant Pro' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{margin:0,background:'#f5f7fb',fontFamily:'Calibri, Arial, sans-serif'}}>{children}</body></html>;
}
