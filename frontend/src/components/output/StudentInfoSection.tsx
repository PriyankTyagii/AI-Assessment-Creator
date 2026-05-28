export function StudentInfoSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-3 py-4 border-b border-gray-300">
      {['Name', 'Roll Number', 'Section'].map((field) => (
        <div key={field} className="flex items-end gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{field}:</span>
          <div className="flex-1 border-b border-gray-400 h-6" />
        </div>
      ))}
    </div>
  );
}
