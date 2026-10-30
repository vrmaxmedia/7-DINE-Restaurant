export const metadata = {
  title: "7 DINE Café and Restaurant | AI Review Generator",
  description: "Share your experience at 7 DINE Café and Restaurant, Yamuna Vihar, Delhi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#a14327" }}>
        {children}
      </body>
    </html>
  );
}
