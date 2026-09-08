import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of WRECK."
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 2026">
      <p>
        These terms govern your use of WRECK. By creating an account or using the service you agree
        to them. Please read them alongside our Privacy Policy.
      </p>

      <LegalSection heading="1. What WRECK is">
        <p>
          WRECK is a personalized fitness software product. It generates training and nutrition
          guidance from information you provide and helps you track and adapt over time. WRECK is
          not a medical device, and it does not provide medical, clinical or professional health
          advice.
        </p>
      </LegalSection>

      <LegalSection heading="2. Not medical advice">
        <p>
          Training and nutrition recommendations are educational and are generated from general
          rules and your inputs. They are starting estimates, not prescriptions. Consult a qualified
          professional before starting any program, especially if you have an injury, a medical
          condition, are pregnant, or take medication. Stop and seek help if you experience pain,
          dizziness or other warning signs.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <p>
          You are responsible for keeping your login credentials secure and for the activity under
          your account. Provide accurate information so that the guidance we generate is relevant to
          you. You must be old enough to consent to processing of your data in your jurisdiction.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>
          Do not misuse the service, attempt to disrupt it, reverse engineer it beyond what the law
          permits, or use it to harm yourself or others. We may suspend accounts that break these
          terms or put other users at risk.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your content and data">
        <p>
          You keep ownership of the data you enter. You grant us the permission needed to store and
          process it to operate the service for you. You can export or delete your fitness data at
          any time from Settings.
        </p>
      </LegalSection>

      <LegalSection heading="6. Availability and changes">
        <p>
          We work to keep WRECK available and accurate, but we provide it on an as-is basis without
          warranties. We may update features and these terms; if we make material changes we will
          take reasonable steps to let you know.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          To the extent permitted by law, WRECK is not liable for indirect or consequential losses
          arising from use of the service. Nothing in these terms limits liability that cannot be
          limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Questions about these terms can be sent to the contact address published with your
          deployment of WRECK.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
