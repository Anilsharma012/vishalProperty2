import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-semibold">TheMatka Properties</h1>
      <p>Browse our latest properties and contact us for details.</p>
      <div className="space-x-3">
        <Link to="/listings" className="underline">All Listings</Link>
        <Link to="/about" className="underline">About</Link>
        <Link to="/contact" className="underline">Contact</Link>
      </div>
    </div>
  );
}
