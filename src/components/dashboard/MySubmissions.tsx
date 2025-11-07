import { Card } from "@/components/ui/card";

export default function MySubmissions() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-2">My Submissions</h2>
      <p className="text-muted-foreground">No submissions found.</p>
    </Card>
  );
}
