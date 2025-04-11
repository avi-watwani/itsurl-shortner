export default function Footer() {
  return (
    <footer className="text-center py-6 bg-[#F9FAFB] text-[#6B7280]">
      <p className="text-sm mb-4">
        © {new Date().getFullYear()} <span className="font-semibold text-[#2563EB]">itsurl.com</span>. All rights reserved.
      </p>
    </footer>
  );
}
