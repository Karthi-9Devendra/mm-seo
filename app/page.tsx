
import { Metadata } from "next";
import { StatesDirectory } from "@/components/StatesDirectory";
import HomeBanner from "@/components/HomeBanner/page";


// export const metadata: Metadata = {
//   title: "Find Doctors Near You | MedMatch - Healthcare Provider Directory",
//   description: "Find and connect with qualified doctors, specialists, and healthcare providers in your state. Search by location, specialty, and more to find the right medical professional for your needs.",
//   keywords: "doctors, healthcare providers, find doctors, medical specialists, physician directory, healthcare directory",
//   openGraph: {
//     title: "Find Doctors Near You | MedMatch - Healthcare Provider Directory",
//     description: "Find and connect with qualified doctors, specialists, and healthcare providers in your state. Search by location, specialty, and more to find the right medical professional for your needs.",
//     type: "website",
//     locale: "en_US",
//     siteName: "MedMatch",
//     images: [
//       {
//         url: "/logo.png",
//         width: 65,
//         height: 60,
//         alt: "MedMatch Logo",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Find Doctors Near You | MedMatch - Healthcare Provider Directory",
//     description: "Find and connect with qualified doctors, specialists, and healthcare providers in your state.",
//     images: ["/logo.png"],
//   },
// };

export default function Home() {
  
  const user= true;
  return (
      <div className="min-h-screen bg-background">
       {/* <HomeBanner /> */}
      <main>
        <StatesDirectory />
      </main>

      {/* Auth Modal */}
      {/* {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setUser(user);
            setShowAuthModal(false);
          }}
        />
      )} */}

      {/* Doctor Join Modal */}
      {/* {showJoinModal && (
        <DoctorJoinModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            toast.success('Welcome to MedMatch! Your profile has been created.');
            setShowJoinModal(false);
          }} */}
        {/* /> */}
      {/* )} */}

    
    
    </div>
  );
}