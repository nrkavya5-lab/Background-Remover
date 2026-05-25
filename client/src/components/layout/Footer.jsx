export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400 dark:text-gray-500">
        <p>&copy; {new Date().getFullYear()} BG Remover. All rights reserved.</p>
        <p>Built with AI — Remove backgrounds instantly.</p>
      </div>
    </footer>
  );
}
