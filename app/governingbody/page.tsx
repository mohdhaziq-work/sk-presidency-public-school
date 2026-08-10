import InnerPageLayout from '@/components/layout/InnerPage';
export default function Page() {
  return <InnerPageLayout title="Governing Body"><div className="text-center py-8">
      <img src="https://skpresidency.com/images/section-pic/governingbody-pic.jpg" alt="Governing Body" className="mx-auto rounded-xl max-w-md shadow-md mb-6" style={{maxWidth:'400px'}} />
      <p className="font-semibold text-lg text-gray-700">Information coming up soon</p>
    </div></InnerPageLayout>;
}