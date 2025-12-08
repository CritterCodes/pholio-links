export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Under Maintenance
        </h1>
        <p className="text-gray-300 text-lg">
          We are currently performing scheduled maintenance to improve our services.
          The dashboard and editing features are temporarily unavailable.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-sm text-gray-400">
            <span className="text-green-400 font-semibold">Note:</span> Public profiles are still online and accessible.
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          Thank you for your patience. We'll be back shortly.
        </p>
      </div>
    </div>
  );
}
