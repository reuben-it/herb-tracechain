import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  apiHarvestHerb,
  apiTransferHerb,
  apiGetMyHerbs,
} from "@/lib/apiHooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Herb {
  id: string;
  name: string;
  species: string;
  harvestDate: string;
  status: string;
  location: string;
}

export default function CollectorDashboard() {
  const { apiClient } = useAuth();
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [qrHerbId, setQrHerbId] = useState<string | null>(null);

  // Harvest form
  const [harvestForm, setHarvestForm] = useState({
    name: "",
    species: "",
    location: "",
    quantity: "",
    harvestDate: new Date().toISOString().split("T")[0],
  });

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    herbId: "",
    recipientEmail: "",
    notes: "",
  });

  // Fetch herbs
  useEffect(() => {
    fetchHerbs();
  }, []);

  const fetchHerbs = async () => {
    try {
      const response = await apiGetMyHerbs(apiClient);
      setHerbs(response.herbs || []);
    } catch (error: any) {
      console.error("Failed to fetch herbs:", error);
      toast.error("Failed to fetch herbs");
    }
  };

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiHarvestHerb(apiClient, harvestForm);
      toast.success("Herb harvested successfully!");
      setQrHerbId(response.herbId);
      setHarvestForm({
        name: "",
        species: "",
        location: "",
        quantity: "",
        harvestDate: new Date().toISOString().split("T")[0],
      });
      fetchHerbs();
    } catch (error: any) {
      toast.error(error.message || "Failed to harvest herb");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiTransferHerb(apiClient, transferForm);
      toast.success("Herb transferred successfully!");
      setTransferForm({
        herbId: "",
        recipientEmail: "",
        notes: "",
      });
      fetchHerbs();
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer herb");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Collector Dashboard">
      <div className="space-y-6">
        <Tabs defaultValue="harvest" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="harvest">Harvest</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="inventory">My Herbs</TabsTrigger>
          </TabsList>

          {/* Harvest Tab */}
          <TabsContent value="harvest" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Record New Harvest</h3>
              <form onSubmit={handleHarvest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Herb Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Basil"
                      value={harvestForm.name}
                      onChange={(e) =>
                        setHarvestForm({ ...harvestForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species">Species</Label>
                    <Input
                      id="species"
                      placeholder="e.g., Ocimum basilicum"
                      value={harvestForm.species}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          species: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Field A"
                      value={harvestForm.location}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          location: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={harvestForm.quantity}
                      onChange={(e) =>
                        setHarvestForm({
                          ...harvestForm,
                          quantity: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={harvestForm.harvestDate}
                    onChange={(e) =>
                      setHarvestForm({
                        ...harvestForm,
                        harvestDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Recording..." : "Record Harvest"}
                </Button>
              </form>
            </Card>

            {/* QR Code Display */}
            {qrHerbId && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">QR Code</h3>
                <div className="flex flex-col items-center gap-4">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${qrHerbId}`}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-sm text-gray-600">
                    Herb ID: <span className="font-mono">{qrHerbId}</span>
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Verification URL: {window.location.origin}/verify/{qrHerbId}
                  </p>
                  <Button
                    onClick={() => setQrHerbId(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Transfer Herb</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="herbId">Select Herb</Label>
                  <select
                    id="herbId"
                    value={transferForm.herbId}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        herbId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Choose a herb...</option>
                    {herbs.map((herb) => (
                      <option key={herb.id} value={herb.id}>
                        {herb.name} ({herb.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="processor@example.com"
                    value={transferForm.recipientEmail}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        recipientEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    placeholder="Add any notes about the transfer..."
                    value={transferForm.notes}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Transferring..." : "Transfer Herb"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">My Herbs</h3>
              {herbs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No herbs recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Harvest Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {herbs.map((herb) => (
                        <TableRow key={herb.id}>
                          <TableCell className="font-medium">
                            {herb.name}
                          </TableCell>
                          <TableCell>{herb.species}</TableCell>
                          <TableCell>{herb.location}</TableCell>
                          <TableCell>
                            {herb.harvestDate ? new Date(herb.harvestDate).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-700">
                              {herb.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
