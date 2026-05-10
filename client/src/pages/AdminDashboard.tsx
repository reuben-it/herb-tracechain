import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Timeline, TimelineStage } from "@/components/Timeline";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiGetAllHerbs } from "@/lib/apiHooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HerbDetail {
  id: string;
  name: string;
  species: string;
  status: string;
  harvestDate: string;
  ethereumHash: string;
  verificationStatus: "verified" | "pending" | "failed";
  timeline: Array<{
    stage: TimelineStage;
    timestamp: string;
    status: "completed" | "current" | "future";
  }>;
  collectorEmail: string;
  processorEmail?: string;
  notes: string;
}

export default function AdminDashboard() {
  const { apiClient } = useAuth();
  const [herbs, setHerbs] = useState<HerbDetail[]>([]);
  const [filteredHerbs, setFilteredHerbs] = useState<HerbDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHerbId, setSelectedHerbId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all herbs
  useEffect(() => {
    fetchAllHerbs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = herbs;

    if (statusFilter !== "all") {
      filtered = filtered.filter((herb) => herb.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (herb) =>
          herb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          herb.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
          herb.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHerbs(filtered);
  }, [herbs, statusFilter, searchTerm]);

  const fetchAllHerbs = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetAllHerbs(apiClient);
      setHerbs(response.herbs || []);
    } catch (error: any) {
      toast.error("Failed to fetch herbs");
      console.error("Failed to fetch herbs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHerb = herbs.find((h) => h.id === selectedHerbId);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Status</Label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="HARVESTED">Harvested</option>
                  <option value="PROCESSED">Processed</option>
                  <option value="PACKAGED">Packaged</option>
                  <option value="DISTRIBUTED">Distributed</option>
                  <option value="VERIFIED">Verified</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by name, species, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              <Button
                onClick={fetchAllHerbs}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </Card>

          {/* Herbs Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              All Herbs ({filteredHerbs.length})
            </h3>
            {filteredHerbs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No herbs found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Harvest Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHerbs.map((herb) => (
                      <TableRow
                        key={herb.id}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">{herb.name}</TableCell>
                        <TableCell>{herb.species}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            {herb.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              herb.verificationStatus === "verified"
                                ? "bg-green-100 text-green-700"
                                : herb.verificationStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {herb.verificationStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(herb.harvestDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              setSelectedHerbId(
                                selectedHerbId === herb.id ? null : herb.id
                              )
                            }
                            variant="outline"
                            size="sm"
                          >
                            {selectedHerbId === herb.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Detail View */}
        <div className="lg:col-span-1">
          {selectedHerb ? (
            <Card className="p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Details</h3>
                <Button
                  onClick={() => setSelectedHerbId(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Herb ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {selectedHerb.id}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedHerb.name}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Species</p>
                  <p className="text-gray-900">{selectedHerb.species}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-gray-900 font-semibold">
                    {selectedHerb.status}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Verification</p>
                  <p
                    className={`font-semibold ${
                      selectedHerb.verificationStatus === "verified"
                        ? "text-green-600"
                        : selectedHerb.verificationStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedHerb.verificationStatus === "verified"
                      ? "✓ Verified"
                      : selectedHerb.verificationStatus === "pending"
                        ? "⏳ Pending"
                        : "✗ Failed"}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Ethereum Hash</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {selectedHerb.ethereumHash}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600">Collector</p>
                  <p className="text-gray-900">{selectedHerb.collectorEmail}</p>
                </div>

                {selectedHerb.processorEmail && (
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600">Processor</p>
                    <p className="text-gray-900">
                      {selectedHerb.processorEmail}
                    </p>
                  </div>
                )}

                {selectedHerb.notes && (
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-900 text-sm">
                      {selectedHerb.notes}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-4">
                  <p className="text-sm font-semibold text-gray-900 mb-4">
                    Timeline
                  </p>
                  <Timeline events={selectedHerb.timeline} />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              <p>Select a herb to view details</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
