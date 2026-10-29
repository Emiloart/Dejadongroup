import { SiteLayout } from "@/components/site-layout";
import { PageSection } from "@/components/page-section";
import { PartnerPaymentReturn } from "@/components/partner-payment-return";

export const metadata = { title: "Payment status", robots: { index: false, follow: false } };

export default function PartnerPaymentPage({ searchParams }: { searchParams: { reference?: string; trxref?: string } }) {
  const reference = (searchParams.reference || searchParams.trxref || "").slice(0, 80);
  return <SiteLayout><PageSection><PartnerPaymentReturn reference={reference} /></PageSection></SiteLayout>;
}
