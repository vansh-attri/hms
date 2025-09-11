import { redirect } from 'next/navigation';

export default function Page() {
  // This route is no longer used. Redirect to Add Test instead.
  redirect('/add-test');
}
