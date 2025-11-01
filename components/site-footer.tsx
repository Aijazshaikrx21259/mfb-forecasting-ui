export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Maryland Food Bank</h3>
            <p className="text-gray-400 text-sm mt-1">
              Fighting hunger across Maryland
            </p>
          </div>

          <div className="text-gray-400 text-sm mt-4 md:mt-0">
            © 2024 Maryland Food Bank. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}