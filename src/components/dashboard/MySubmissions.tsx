import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Submission {
  id: string;
  title: string;
  property_type: string;
  location: string;
  price: number;
  area: number;
  area_unit: string;
  status: string;
  created_at: string;
  admin_notes?: string;
}

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("property_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading your submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">You haven't submitted any properties yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">My Property Submissions</h2>
      {submissions.map((submission) => (
        <Card key={submission.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{submission.title}</h3>
              <p className="text-sm text-muted-foreground">
                {submission.location} • {submission.area} {submission.area_unit}
              </p>
            </div>
            <Badge className={getStatusColor(submission.status)}>
              {submission.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{submission.property_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">{formatPrice(submission.price)}</p>
            </div>
          </div>

          {submission.admin_notes && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Admin Notes:</p>
              <p className="text-sm text-muted-foreground">{submission.admin_notes}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Submitted on {new Date(submission.created_at).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
};

export default MySubmissions;
