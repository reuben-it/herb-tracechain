import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  apiProcessHerb,
  apiPackageHerb,
  apiDistributeHerb,
  apiGetInProgressHerbs,
} from "@/lib/apiHooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InProgressHerb {
  id: string;
  name: string;
  species: string;
  status: string;
  receivedDate: string;
  currentStage: string;
}

export default function ProcessorDashboard() {
  const { apiClient } = useAuth();
  const [inProgressHerbs, setInProgressHerbs] = useState<InProgressHerb[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Process form
  const [processForm, setProcessForm] = useState({
    herbId: "",
    processingMethod: "",
    duration: "",
    temperature: "",
    notes: "",
  });

  // Package form
  const [packageForm, setPackageForm] = useState({
    herbId: "",
    packageSize: "",
    packageType: "",
    quantity: "",
    expiryDate: "",
  });

  // Distribute form
  const [distributeForm, setDistributeForm] = useState({
    herbId: "",
    recipientEmail: "",
    distributionDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Fetch in-progress herbs
  useEffect(() => {
    fetchInProgressHerbs();
  }, []);

  const fetchInProgressHerbs = async () => {
    try {
      const response = await apiGetInProgressHerbs(apiClient);
      setInProgressHerbs(response.herbs || []);
    } catch (error: any) {
      console.error("Failed to fetch in-progress herbs:", error);
      toast.error("Failed to fetch herbs");
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiProcessHerb(apiClient, processForm);
      toast.success("Herb processing recorded!");
      setProcessForm({
        herbId: "",
        processingMethod: "",
        duration: "",
        temperature: "",
        notes: "",
      });
      fetchInProgressHerbs();
    } catch (error: any) {
      toast.error(error.message || "Failed to process herb");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiPackageHerb(apiClient, packageForm);
      toast.success("Herb packaged successfully!");
      setPackageForm({
        herbId: "",
        packageSize: "",
        packageType: "",
        quantity: "",
        expiryDate: "",
      });
      fetchInProgressHerbs();
    } catch (error: any) {
      toast.error(error.message || "Failed to package herb");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiDistributeHerb(apiClient, distributeForm);
      toast.success("Herb distributed successfully!");
      setDistributeForm({
        herbId: "",
        recipientEmail: "",
        distributionDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchInProgressHerbs();
    } catch (error: any) {
      toast.error(error.message || "Failed to distribute herb");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Processor Dashboard">
      <div className="space-y-6">
        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="package">Package</TabsTrigger>
            <TabsTrigger value="distribute">Distribute</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
          </TabsList>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Process Herb</h3>
              <form onSubmit={handleProcess} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="processHerbId">Select Herb</Label>
                  <select
                    id="processHerbId"
                    value={processForm.herbId}
                    onChange={(e) =>
                      setProcessForm({
                        ...processForm,
                        herbId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a herb...</option>
                    {inProgressHerbs.map((herb) => (
                      <option key={herb.id} value={herb.id}>
                        {herb.name} ({herb.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processingMethod">Processing Method</Label>
                    <Input
                      id="processingMethod"
                      placeholder="e.g., Drying, Grinding"
                      value={processForm.processingMethod}
                      onChange={(e) =>
                        setProcessForm({
                          ...processForm,
                          processingMethod: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="0"
                      value={processForm.duration}
                      onChange={(e) =>
                        setProcessForm({
                          ...processForm,
                          duration: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    placeholder="0"
                    value={processForm.temperature}
                    onChange={(e) =>
                      setProcessForm({
                        ...processForm,
                        temperature: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processNotes">Notes</Label>
                  <textarea
                    id="processNotes"
                    placeholder="Add processing notes..."
                    value={processForm.notes}
                    onChange={(e) =>
                      setProcessForm({
                        ...processForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Processing..." : "Record Processing"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Package Tab */}
          <TabsContent value="package" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Package Herb</h3>
              <form onSubmit={handlePackage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packageHerbId">Select Herb</Label>
                  <select
                    id="packageHerbId"
                    value={packageForm.herbId}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        herbId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a herb...</option>
                    {inProgressHerbs.map((herb) => (
                      <option key={herb.id} value={herb.id}>
                        {herb.name} ({herb.species})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageType">Package Type</Label>
                    <Input
                      id="packageType"
                      placeholder="e.g., Box, Bag"
                      value={packageForm.packageType}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          packageType: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageSize">Package Size</Label>
                    <Input
                      id="packageSize"
                      placeholder="e.g., 500g"
                      value={packageForm.packageSize}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          packageSize: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity of Packages</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={packageForm.quantity}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        quantity: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={packageForm.expiryDate}
                    onChange={(e) =>
                      setPackageForm({
                        ...packageForm,
                        expiryDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Packaging..." : "Record Packaging"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Distribute Tab */}
          <TabsContent value="distribute" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Distribute Herb</h3>
              <form onSubmit={handleDistribute} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distributeHerbId">Select Herb</Label>
                  <select
                    id="distributeHerbId"
                    value={distributeForm.herbId}
                    onChange={(e) =>
                      setDistributeForm({
                        ...distributeForm,
                        herbId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a herb...</option>
                    {inProgressHerbs.map((herb) => (
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
                    placeholder="recipient@example.com"
                    value={distributeForm.recipientEmail}
                    onChange={(e) =>
                      setDistributeForm({
                        ...distributeForm,
                        recipientEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distributionDate">Distribution Date</Label>
                  <Input
                    id="distributionDate"
                    type="date"
                    value={distributeForm.distributionDate}
                    onChange={(e) =>
                      setDistributeForm({
                        ...distributeForm,
                        distributionDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distributeNotes">Notes</Label>
                  <textarea
                    id="distributeNotes"
                    placeholder="Add distribution notes..."
                    value={distributeForm.notes}
                    onChange={(e) =>
                      setDistributeForm({
                        ...distributeForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Distributing..." : "Record Distribution"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* In Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">In Progress Herbs</h3>
              {inProgressHerbs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No herbs in progress
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Species</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Received Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inProgressHerbs.map((herb) => (
                        <TableRow key={herb.id}>
                          <TableCell className="font-medium">
                            {herb.name}
                          </TableCell>
                          <TableCell>{herb.species}</TableCell>
                          <TableCell>{herb.currentStage}</TableCell>
                          <TableCell>
                            {new Date(herb.receivedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
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
