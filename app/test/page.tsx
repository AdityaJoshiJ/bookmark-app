import { supabase } from '@/lib/supabase';

export default async function TestPage() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-red-500 font-bold text-2xl">Supabase Connection Error</h1>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-green-600 font-bold text-3xl">Supabase Connected</h1>
      <p className="mt-4 text-gray-700">Successfully fetched data from the <code className="bg-gray-200 px-1 rounded">profiles</code> table.</p>
      {data && data.length > 0 ? (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded">
          <p className="text-green-800 font-medium">Data found: {data.length} row(s)</p>
        </div>
      ) : (
        <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded">
          <p className="text-yellow-800 italic">The table is currently empty, but the connection was successful.</p>
        </div>
      )}
    </div>
  );
}
