/**
 * ADMIN (admin only)
 * TODO:
 * - [ ] Parse the CSV (email,group) in the browser and preview the rows
 * - [ ] Look up group ids by name, upsert into `roster` (role = freshman, or frog)
 *       New sign-ups get role + group from the roster automatically (handle_new_user trigger).
 * - [ ] Update `profiles` for people who already have accounts
 * - [ ] Link to FROGlympics verification
 */
import { useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function AdminPage() {
  const [file, setFile] = useState(/** @type {File | null} */ (null));

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-extrabold text-frog-900">Admin</h1>

      <Card title="Upload roster (CSV)">
        <p className="mb-2 text-sm text-neutral-500">
          Assign freshmen to FROG groups before FROG Week.
        </p>
        <pre className="mb-3 rounded-lg bg-neutral-100 p-3 text-xs">
          email,group{'\n'}dukedog@dukes.jmu.edu,Duke Dogs{'\n'}newstudent@dukes.jmu.edu,Quad Squad
        </pre>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-frog-100 file:px-3 file:py-2 file:font-semibold file:text-frog-800"
        />
        {file && <p className="mt-2 text-xs text-neutral-500">Selected: {file.name}</p>}
        {/* Demo: upload isn't implemented; the button is intentionally a no-op. */}
        <Button full className="mt-4">
          Upload
        </Button>
      </Card>

      <Card title="FROGlympics verification">
        <Button variant="secondary" to="/frog/olympics" full>
          Open results
        </Button>
      </Card>
    </div>
  );
}
