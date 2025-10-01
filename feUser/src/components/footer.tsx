import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Đặc Sản Sóc Trăng. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/privacy-policy" className="hover:text-green-600">Privacy Policy</Link>
          <span className="mx-2">|</span>
          <Link href="/terms-of-service" className="hover:text-green-600">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}