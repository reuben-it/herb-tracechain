import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timeline, TimelineStage } from "@/components/Timeline";
import { Leaf, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { apiVerifyHerb } from "@/lib/apiHooks";
import { toast } from "sonner";

interface HerbVerificationData {
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
  collectorName: string;
  processorName?: string;
  notes: string;
}

interface VerifyPageProps {
  herbId: string;
}

export default function VerifyPage({ herbId }: VerifyPageProps) {
  const [herb, setHerb] = useState<HerbVerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHerbData();
  }, [herbId]);

  const fetchHerbData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiVerifyHerb(herbId);
      setHerb(response.herb);
    } catch (err: any) {
      setError(err.message || "Failed to fetch herb information");
      toast.error("Herb not found or verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Leaf className="w-12 h-12 text-green-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading herb information...</p>
        </div>
      </div>
    );
  }

  if (error || !herb) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The herb could not be verified. Please check the QR code and try again."}
            </p>
            <Button
              onClick={fetchHerbData}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getVerificationIcon = () => {
    switch (herb.verificationStatus) {
      case "verified":
        return (
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        );
      case "pending":
        return <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />;
      default:
        return (
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        );
    }
  };

  const getVerificationColor = () => {
    switch (herb.verificationStatus) {
      case "verified":
        return "text-green-700 bg-green-50";
      case "pending":
        return "text-yellow-700 bg-yellow-50";
      default:
        return "text-red-700 bg-red-50";
    }
  };

  const getVerificationText = () => {
    switch (herb.verificationStatus) {
      case "verified":
        return "✓ Verified";
      case "pending":
        return "⏳ Pending Verification";
      default:
        return "✗ Verification Failed";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-900">
              Herb Verification
            </h1>
          </div>
          <p className="text-gray-600">
            Blockchain-powered supply chain verification
          </p>
        </div>

        {/* Verification Status */}
        <Card className={`p-8 shadow-lg ${getVerificationColor()}`}>
          <div className="text-center">
            {getVerificationIcon()}
            <h2 className="text-2xl font-bold mb-2">
              {getVerificationText()}
            </h2>
            <p className="text-sm opacity-90">
              {herb.verificationStatus === "verified"
                ? "This herb has been verified on the blockchain"
                : herb.verificationStatus === "pending"
                  ? "This herb is pending verification on the blockchain"
                  : "This herb could not be verified on the blockchain"}
            </p>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Herb Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">
                Herb Information
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {herb.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Species</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {herb.species}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Harvest Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {herb.harvestDate ? new Date(herb.harvestDate).toLocaleDateString() : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {herb.status}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Herb ID</p>
                <p className="font-mono text-sm text-gray-900 break-all bg-gray-100 p-3 rounded">
                  {herb.id}
                </p>
              </div>

              {herb.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-900">{herb.notes}</p>
                </div>
              )}
            </Card>

            {/* Blockchain Information */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Blockchain Verification
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ethereum Hash</p>
                  <p className="font-mono text-xs text-gray-900 break-all bg-gray-100 p-3 rounded">
                    {herb.ethereumHash}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    This herb's supply chain data has been recorded on the
                    Ethereum blockchain for immutable verification.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Participants */}
          <div className="space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Participants
              </h3>

              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Collector</p>
                  <p className="font-semibold text-gray-900">
                    {herb.collectorName}
                  </p>
                </div>

                {herb.processorName && (
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Processor</p>
                    <p className="font-semibold text-gray-900">
                      {herb.processorName}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-900 text-center">
                    All participants are verified on the blockchain
                  </p>
                </div>
              </div>
            </Card>

            {/* QR Code Info */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Verification Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This page was accessed via QR code. The code encodes the herb ID
                for quick verification.
              </p>
              <Button
                onClick={fetchHerbData}
                variant="outline"
                className="w-full"
              >
                Refresh Data
              </Button>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-6 text-gray-900">
            Supply Chain Timeline
          </h3>
          <Timeline events={herb.timeline} />
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 py-4">
          <p>
            Herb ID: <span className="font-mono">{herb.id}</span>
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
