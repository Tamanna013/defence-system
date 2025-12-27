import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Camera,
  Shield,
  Settings,
  Activity,
  Users,
  Car,
  Dog,
  Drone,
} from "lucide-react";

interface Detection {
  id: string;
  type: "human" | "vehicle" | "animal" | "drone";
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  timestamp: Date;
  threatLevel: "Low" | "Medium" | "High";
  feedId: string;
}

interface Alert {
  id: string;
  detection: Detection;
  message: string;
  recommendation: string;
  acknowledged: boolean;
  timestamp: Date;
}

interface Feed {
  id: string;
  name: string;
  location: string;
  type: "CCTV" | "Drone";
  status: "Active" | "Inactive";
  detections: Detection[];
}

const IntrusionDetectionSystem: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([
    {
      id: "feed1",
      name: "Main Entrance",
      location: "Building A",
      type: "CCTV",
      status: "Active",
      detections: [],
    },
    {
      id: "feed2",
      name: "Parking Lot",
      location: "Zone B",
      type: "CCTV",
      status: "Active",
      detections: [],
    },
    {
      id: "feed3",
      name: "Perimeter North",
      location: "Sector 1",
      type: "Drone",
      status: "Active",
      detections: [],
    },
    {
      id: "feed4",
      name: "Warehouse",
      location: "Building C",
      type: "CCTV",
      status: "Active",
      detections: [],
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string>("feed1");
  const [isProcessing, setIsProcessing] = useState(true);
  const [stats, setStats] = useState({
    totalDetections: 0,
    highThreatAlerts: 0,
    falseAlarmRate: 12,
    systemUptime: "99.8%",
  });

  const detectionIntervalRef = useRef<NodeJS.Timeout>();

  // Simulate AI detection processing
  useEffect(() => {
    if (isProcessing) {
      detectionIntervalRef.current = setInterval(() => {
        simulateDetection();
      }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isProcessing]);

  const simulateDetection = () => {
    const detectionTypes: Detection["type"][] = [
      "human",
      "vehicle",
      "animal",
      "drone",
    ];
    const threatLevels: Detection["threatLevel"][] = ["Low", "Medium", "High"];

    const randomFeed = feeds[Math.floor(Math.random() * feeds.length)];
    const randomType =
      detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

    // Threat level logic based on type and context
    let threatLevel: Detection["threatLevel"] = "Low";
    if (randomType === "human" && confidence > 0.85) {
      threatLevel = Math.random() > 0.7 ? "Medium" : "High";
    } else if (
      randomType === "vehicle" &&
      randomFeed.location.includes("Parking")
    ) {
      threatLevel = "Low";
    } else if (randomType === "drone") {
      threatLevel = Math.random() > 0.5 ? "Medium" : "High";
    }

    const detection: Detection = {
      id: `det_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: randomType,
      confidence,
      position: {
        x: Math.random() * 300,
        y: Math.random() * 200,
        width: 40 + Math.random() * 60,
        height: 40 + Math.random() * 60,
      },
      timestamp: new Date(),
      threatLevel,
      feedId: randomFeed.id,
    };

    // Update feeds with new detection
    setFeeds((prev) =>
      prev.map((feed) =>
        feed.id === randomFeed.id
          ? { ...feed, detections: [...feed.detections.slice(-4), detection] }
          : feed
      )
    );

    // Generate alert for medium/high threats
    if (threatLevel === "Medium" || threatLevel === "High") {
      generateAlert(detection);
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalDetections: prev.totalDetections + 1,
      highThreatAlerts:
        threatLevel === "High"
          ? prev.highThreatAlerts + 1
          : prev.highThreatAlerts,
    }));
  };

  const generateAlert = (detection: Detection) => {
    const recommendations = {
      human: {
        High: "Dispatch security personnel immediately. Verify identity and intent.",
        Medium:
          "Monitor closely. Prepare security response if behavior escalates.",
      },
      vehicle: {
        High: "Block access routes. Verify authorization immediately.",
        Medium: "Check vehicle registration. Monitor movement patterns.",
      },
      animal: {
        High: "Contact animal control. Ensure personnel safety.",
        Medium: "Monitor animal behavior. Clear area if aggressive.",
      },
      drone: {
        High: "Activate counter-drone measures. Alert aviation authorities.",
        Medium: "Track drone path. Attempt identification of operator.",
      },
    };

    const alert: Alert = {
      id: `alert_${Date.now()}`,
      detection,
      message: `${detection.threatLevel} threat detected: ${
        detection.type
      } at ${feeds.find((f) => f.id === detection.feedId)?.name}`,
      recommendation:
        recommendations[detection.type][
          detection.threatLevel as "High" | "Medium"
        ] || "Monitor situation closely.",
      acknowledged: false,
      timestamp: new Date(),
    };

    setAlerts((prev) => [alert, ...prev.slice(0, 9)]);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getDetectionIcon = (type: Detection["type"]) => {
    switch (type) {
      case "human":
        return <Users className="w-4 h-4" />;
      case "vehicle":
        return <Car className="w-4 h-4" />;
      case "animal":
        return <Dog className="w-4 h-4" />;
      case "drone":
        return <Drone className="w-4 h-4" />;
    }
  };

  const getThreatColor = (level: Detection["threatLevel"]) => {
    switch (level) {
      case "Low":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "High":
        return "text-red-600 bg-red-100";
    }
  };

  const currentFeed = feeds.find((f) => f.id === selectedFeed);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">
                AI Intrusion Detection System
              </h1>
              <p className="text-gray-400">
                Real-time surveillance monitoring and threat assessment
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity
                className={`w-5 h-5 ${
                  isProcessing ? "text-green-400" : "text-red-400"
                }`}
              />
              <span className="text-sm">
                {isProcessing ? "Processing" : "Paused"}
              </span>
            </div>
            <button
              onClick={() => setIsProcessing(!isProcessing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isProcessing ? "Pause" : "Resume"}
            </button>
            <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Detections</p>
                <p className="text-2xl font-bold">{stats.totalDetections}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Threat Alerts</p>
                <p className="text-2xl font-bold text-red-400">
                  {stats.highThreatAlerts}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">False Alarm Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.falseAlarmRate}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">System Uptime</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.systemUptime}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Live Feed Monitor</h2>
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">
                    {currentFeed?.name}
                  </span>
                </div>
              </div>

              {/* Feed Selector */}
              <div className="flex space-x-2 mb-4">
                {feeds.map((feed) => (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeed(feed.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFeed === feed.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {feed.name}
                  </button>
                ))}
              </div>

              {/* Simulated Feed Display */}
              <div
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{ height: "400px" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Live Feed: {currentFeed?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentFeed?.location}
                    </p>
                  </div>
                </div>

                {/* Detection Overlays */}
                {currentFeed?.detections.map((detection) => (
                  <div
                    key={detection.id}
                    className={`absolute border-2 rounded ${
                      detection.threatLevel === "High"
                        ? "border-red-500"
                        : detection.threatLevel === "Medium"
                        ? "border-yellow-500"
                        : "border-green-500"
                    }`}
                    style={{
                      left: detection.position.x,
                      top: detection.position.y,
                      width: detection.position.width,
                      height: detection.position.height,
                    }}
                  >
                    <div
                      className={`absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium ${
                        detection.threatLevel === "High"
                          ? "bg-red-500"
                          : detection.threatLevel === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {detection.type} ({Math.round(detection.confidence * 100)}
                      %)
                    </div>
                  </div>
                ))}

                {/* Feed Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">LIVE</span>
                </div>
              </div>

              {/* Recent Detections */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Recent Detections
                </h3>
                <div className="space-y-2">
                  {currentFeed?.detections
                    .slice(-3)
                    .reverse()
                    .map((detection) => (
                      <div
                        key={detection.id}
                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getDetectionIcon(detection.type)}
                          <div>
                            <p className="font-medium capitalize">
                              {detection.type}
                            </p>
                            <p className="text-sm text-gray-400">
                              {detection.timestamp.toLocaleTimeString()} •{" "}
                              {Math.round(detection.confidence * 100)}%
                              confidence
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(
                            detection.threatLevel
                          )}`}
                        >
                          {detection.threatLevel}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                Active Alerts
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts
                  .filter((alert) => !alert.acknowledged)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-gray-700 p-4 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDetectionIcon(alert.detection.type)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(
                              alert.detection.threatLevel
                            )}`}
                          >
                            {alert.detection.threatLevel}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {alert.recommendation}
                      </p>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))}
                {alerts.filter((alert) => !alert.acknowledged).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-sm">System monitoring normally</p>
                  </div>
                )}
              </div>
            </div>

            {/* Feed Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Feed Status</h2>
              <div className="space-y-3">
                {feeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{feed.name}</p>
                      <p className="text-sm text-gray-400">
                        {feed.location} • {feed.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          feed.status === "Active"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <span className="text-sm">{feed.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntrusionDetectionSystem;
