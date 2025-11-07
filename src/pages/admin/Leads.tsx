import { useState } from "react";
import { MessageSquare, Phone, Mail, Plus, Eye, Edit2, Calendar } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sampleLeads, sampleAgents } from "@/data/sampleData";

const Leads = () => {
  const [leads, setLeads] = useState(sampleLeads);
  const [filterSource, setFilterSource] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const statuses = ["new", "contacted", "qualified", "site-visit", "offer", "won", "lost"];

  const filteredLeads = leads.filter(lead => {
    const matchSource = filterSource === "all" || lead.source === filterSource;
    const matchSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lead.phone.includes(searchTerm) ||
                       lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSource && matchSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-purple-100 text-purple-800",
      qualified: "bg-green-100 text-green-800",
      "site-visit": "bg-yellow-100 text-yellow-800",
      offer: "bg-orange-100 text-orange-800",
      won: "bg-emerald-100 text-emerald-800",
      lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Website: "bg-blue-100 text-blue-800",
      WhatsApp: "bg-green-100 text-green-800",
      "Google Ads": "bg-yellow-100 text-yellow-800",
      Referral: "bg-purple-100 text-purple-800",
      "Walk-in": "bg-pink-100 text-pink-800",
    };
    return colors[source] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Leads & CRM</h1>
            <p className="text-muted-foreground mt-1">Manage customer inquiries and track conversions</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>+ Add Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
                <DialogDescription>Create a new customer inquiry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input placeholder="Full name" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input placeholder="10-digit number" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
                <div>
                  <Label>Requirement *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="pg">PG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Add Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{leads.filter(l => l.status === "new").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Qualified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{leads.filter(l => l.status === "qualified").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Won</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{leads.filter(l => l.status === "won").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Search by name, phone, email</Label>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Source</Label>
                <Select value={filterSource} onValueChange={setFilterSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <Tabs defaultValue="table" value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No leads found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell className="text-sm">
                              <div className="flex flex-col gap-1">
                                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                  {lead.phone}
                                </a>
                                {lead.email && (
                                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline text-xs">
                                    {lead.email}
                                  </a>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{lead.requirement}</TableCell>
                            <TableCell className="text-sm">
                              ₹{(lead.budget.min / 100000).toFixed(0)}L - ₹{(lead.budget.max / 100000).toFixed(0)}L
                            </TableCell>
                            <TableCell>
                              <Badge className={getSourceColor(lead.source)}>
                                {lead.source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(lead.status)}>
                                {lead.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {lead.assignedAgent ? (
                                sampleAgents.find(a => a.id === lead.assignedAgent)?.name || "Unassigned"
                              ) : (
                                <span className="text-muted-foreground">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog open={openDetail && selectedLead?.id === lead.id} onOpenChange={setOpenDetail}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedLead(lead)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Lead Details</DialogTitle>
                                    </DialogHeader>
                                    {selectedLead && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-muted-foreground">Name</Label>
                                          <p className="font-medium">{selectedLead.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <a href={`https://wa.me/91${selectedLead.phone.slice(-10)}`} target="_blank" rel="noopener noreferrer">
                                              <Button variant="outline" size="sm" className="w-full gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                WhatsApp
                                              </Button>
                                            </a>
                                          </div>
                                          <div>
                                            <Label className="text-muted-foreground">Email</Label>
                                            <a href={`mailto:${selectedLead.email}`}>
                                              <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                              </Button>
                                            </a>
                                          </div>
                                        </div>
                                        <div>
                                          <Label className="text-muted-foreground">Requirement</Label>
                                          <p className="font-medium capitalize">{selectedLead.requirement}</p>
                                        </div>
                                        <div>
                                          <Label className="text-muted-foreground">Budget</Label>
                                          <p className="font-medium">₹{(selectedLead.budget.min / 100000).toFixed(0)}L - ₹{(selectedLead.budget.max / 100000).toFixed(0)}L</p>
                                        </div>
                                        <div>
                                          <Label className="text-muted-foreground">Notes</Label>
                                          <p className="text-sm">{selectedLead.notes}</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="outline" className="flex-1">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Visit
                                          </Button>
                                          <Button variant="outline" className="flex-1">
                                            <Phone className="h-4 w-4 mr-2" />
                                            Call Log
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kanban View */}
          <TabsContent value="kanban" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statuses.map((status) => {
                const statusLeads = filteredLeads.filter(l => l.status === status);
                return (
                  <Card key={status} className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        {status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} ({statusLeads.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {statusLeads.map((lead) => (
                        <div key={lead.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md cursor-pointer">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{lead.phone}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            <Badge className="text-xs" variant="secondary">
                              {lead.requirement}
                            </Badge>
                            <Badge className={`text-xs ${getSourceColor(lead.source)}`}>
                              {lead.source}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {statusLeads.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">No leads</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Leads;
