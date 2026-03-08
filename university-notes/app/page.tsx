import Hero from "@/components/Hero";
import NotesSection from "@/components/NotesSection";
import AboutSection from "@/components/AboutSection";
import FeedbackSection from "@/components/FeedbackSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { getNotes, getFeedbacks, checkAdminStatus } from "@/app/actions";

export default async function Home() {
  const notes = await getNotes();
  const feedbacks = await getFeedbacks();
  const isAdmin = await checkAdminStatus();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-20 pb-20">
      <Hero />
      <NotesSection initialNotes={notes} />
      <AboutSection />
      <FeedbackSection initialFeedbacks={feedbacks} isAdmin={isAdmin} />
      <ContactSection />
      <Footer />
    </div>
  );
}
