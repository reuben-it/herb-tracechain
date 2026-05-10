import { Check, Circle } from "lucide-react";

export type TimelineStage = "HARVESTED" | "DISTRIBUTED" | "PROCESSED" | "PACKAGED" | "VERIFIED";

interface TimelineEvent {
  stage: TimelineStage;
  timestamp?: string;
  status: "completed" | "current" | "future";
}

interface TimelineProps {
  events: TimelineEvent[];
}

const stageLabels: Record<TimelineStage, string> = {
  HARVESTED: "Harvested",
  DISTRIBUTED: "Distributed",
  PROCESSED: "Processed",
  PACKAGED: "Packaged",
  VERIFIED: "Verified",
};

export function Timeline({ events }: TimelineProps) {
  const stages: TimelineStage[] = [
    "HARVESTED",
    "PROCESSED",
    "PACKAGED",
    "DISTRIBUTED",
    "VERIFIED",
  ];

  return (
    <div className="space-y-8">
      {stages.map((stage, index) => {
        const event = events.find((e) => e.stage === stage);
        const status = event?.status || "future";

        return (
          <div key={stage} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  status === "completed"
                    ? "bg-green-600 text-white"
                    : status === "current"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`w-1 h-12 mt-2 ${
                    status === "completed" ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Timeline content */}
            <div className="pt-2">
              <h3
                className={`font-semibold ${
                  status === "completed"
                    ? "text-green-700"
                    : status === "current"
                      ? "text-blue-700"
                      : "text-gray-400"
                }`}
              >
                {stageLabels[stage]}
              </h3>
              {event?.timestamp && (
                <p className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
