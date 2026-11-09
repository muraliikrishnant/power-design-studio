import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/buck", label: "Buck Converter Design" },
  { href: "/pdn", label: "PDN Analysis" },
  { href: "/appnote", label: "Application Note" },
  { href: "/bench", label: "Bench Test Log" },
];

export default function NavBar() {
  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <Link href="/" className="font-semibold text-slate-100">
          Power Design Studio
        </Link>
        <nav className="flex gap-4 text-sm flex-wrap">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
