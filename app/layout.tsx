import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siddhivinayak Ultrasound Centre Palwal | 3D Ultrasound, Color Doppler & Diagnostic Imaging",
  description: "Best Ultrasound Center in Palwal offering 3D/4D Ultrasound, Color Doppler, Pregnancy Scans, Fetal Medicine & Advanced Diagnostic Imaging. Trusted by 10,000+ patients. Contact us today!",
  keywords: [
    "3D Ultrasound in Palwal",
    "Color Ultrasound in Palwal", 
    "Ultrasound Center in Palwal",
    "Best Ultrasound in Palwal",
    "Color Doppler Palwal",
    "4D Ultrasound Palwal",
    "Pregnancy Scan Palwal",
    "Fetal Medicine Palwal",
    "Sonography Center Palwal",
    "Diagnostic Center Palwal",
    "NT NB Scan Palwal",
    "Anomaly Scan Palwal",
    "Siddhivinayak Ultrasound",
    "Dr Virender Hospital Palwal"
  ],
  authors: [{ name: "Siddhivinayak Ultrasound Centre" }],
  creator: "Siddhivinayak Ultrasound Centre",
  publisher: "Siddhivinayak Ultrasound Centre",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://drvirenderhospital.com",
    siteName: "Siddhivinayak Ultrasound Centre",
    title: "Siddhivinayak Ultrasound Centre Palwal | Best 3D Ultrasound & Color Doppler",
    description: "Leading Ultrasound Center in Palwal offering 3D/4D Ultrasound, Color Doppler, Pregnancy Scans & Advanced Diagnostic Imaging. Trusted healthcare since years.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Siddhivinayak Ultrasound Centre Palwal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siddhivinayak Ultrasound Centre Palwal | 3D Ultrasound & Color Doppler",
    description: "Best Ultrasound Center in Palwal - 3D/4D Ultrasound, Color Doppler, Pregnancy Scans & Diagnostic Imaging",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://drvirenderhospital.com",
  },
  category: "Healthcare",
  verification: {
    google: "G-541QDNKMQZ",
  },
  other: {
    "geo.region": "IN-HR",
    "geo.placename": "Palwal, Haryana",
    "geo.position": "28.1447;77.3320",
    "ICBM": "28.1447, 77.3320",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Local Business Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "@id": "https://drvirenderhospital.com",
              "name": "Siddhivinayak Ultrasound Centre",
              "alternateName": "Dr Virender Hospital Palwal",
              "description": "Best Ultrasound Center in Palwal offering 3D/4D Ultrasound, Color Doppler, Pregnancy Scans, Fetal Medicine & Advanced Diagnostic Imaging.",
              "url": "https://drvirenderhospital.com",
              "logo": "https://drvirenderhospital.com/logo.png",
              "image": "https://drvirenderhospital.com/logo.png",
              "telephone": "+91-9812345678",
              "email": "info@drvirenderhospital.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Market",
                "addressLocality": "Palwal",
                "addressRegion": "Haryana",
                "postalCode": "121102",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.1447,
                "longitude": 77.3320
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                  "opens": "09:00",
                  "closes": "20:00"
                }
              ],
              "priceRange": "₹₹",
              "medicalSpecialty": [
                "Diagnostic Radiology",
                "Obstetrics",
                "Fetal Medicine"
              ],
              "availableService": [
                {
                  "@type": "MedicalProcedure",
                  "name": "3D Ultrasound",
                  "description": "Advanced 3D Ultrasound imaging in Palwal"
                },
                {
                  "@type": "MedicalProcedure", 
                  "name": "4D Ultrasound",
                  "description": "Real-time 4D Ultrasound imaging"
                },
                {
                  "@type": "MedicalProcedure",
                  "name": "Color Doppler",
                  "description": "Color Doppler Ultrasound in Palwal"
                },
                {
                  "@type": "MedicalProcedure",
                  "name": "Pregnancy Scan",
                  "description": "Complete pregnancy ultrasound scans"
                },
                {
                  "@type": "MedicalProcedure",
                  "name": "NT NB Scan",
                  "description": "Nuchal Translucency and Nasal Bone screening"
                },
                {
                  "@type": "MedicalProcedure",
                  "name": "Anomaly Scan",
                  "description": "Level 2 Anomaly Scan for fetal abnormalities"
                }
              ],
              "areaServed": {
                "@type": "City",
                "name": "Palwal"
              },
              "sameAs": []
            })
          }}
        />
        <script src="https://t.contentsquare.net/uxa/535ee3529bbca.js" defer></script>
        
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PFT7XM5B');`}
        </Script>
        
        {/* Google tag (gtag.js) - Google Analytics */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-541QDNKMQZ" 
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-541QDNKMQZ');`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PFT7XM5B"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
