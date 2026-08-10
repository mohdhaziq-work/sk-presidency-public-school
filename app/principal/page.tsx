import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Principal's Message"><div className="flex justify-center mb-6">
      <img src="https://skpresidency.com/images/principal-message.jpg" alt="Principal's Message" className="rounded-xl max-w-full shadow-md" />
    </div></InnerPageLayout>;
}