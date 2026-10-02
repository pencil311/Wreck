import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WRECK handles your data."
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <p>
        This policy explains what data WRECK collects, why, and the control you have over it. We aim
        to collect only what is needed to build and adapt your plan.
      </p>

      <LegalSection heading="What we collect">
        <p>
          Account details (email, a display name and a securely hashed password). Fitness profile
          data you provide during onboarding (goal, identity, availability, equipment, body metrics,
          diet, cuisine, budget and recovery context). Activity you log: workouts, meals, check-ins
          and body metrics. Optional progress photos if you choose to add them.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          Your data is used to generate your training and nutrition plan, to adapt it over time, and
          to show your progress back to you. Deterministic engines perform the calculations. Where
          an AI coach is enabled, a limited, structured summary of your context is sent to the model
          provider to phrase explanations; the model is not used to invent your numbers.
        </p>
      </LegalSection>

      <LegalSection heading="Body data and photos are private by default">
        <p>
          Body metrics and any progress photos are private to your account. Photos, where supported,
          are stored in controlled private storage. We never sell your data.
        </p>
      </LegalSection>

      <LegalSection heading="Storage and security">
        <p>
          Passwords are stored only as bcrypt hashes, never in plain text. Sessions use signed,
          http-only cookies. In production, data is stored in a Postgres database with row-level
          security, and privileged operations run only on the server.
        </p>
      </LegalSection>

      <LegalSection heading="Your controls">
        <p>
          From Settings you can export a full copy of your fitness data as JSON, or delete it. You
          can edit your profile answers at any time, which reconfigures your plan.
        </p>
      </LegalSection>

      <LegalSection heading="Third parties">
        <p>
          We use infrastructure providers to host the application and database, and optionally a
          model provider for the AI coach. These providers process data on our behalf under their
          own terms. We share only what is necessary to run the service.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If we change this policy materially, we will take reasonable steps to inform you before the
          change takes effect.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
