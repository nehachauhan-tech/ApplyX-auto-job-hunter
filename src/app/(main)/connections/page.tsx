import { createClient } from "@/lib/supabase/server";
import {
  Link2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const platforms = [
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Connect your LinkedIn to import profile data and apply to jobs",
    icon: "/icons/linkedin.svg",
    color: "bg-[#0A66C2]",
    available: true,
  },
  {
    id: "indeed",
    name: "Indeed",
    description: "Search and apply to millions of jobs on Indeed",
    icon: "/icons/indeed.svg",
    color: "bg-[#2164f3]",
    available: true,
  },
  {
    id: "naukri",
    name: "Naukri",
    description: "India's #1 job portal with millions of opportunities",
    icon: "/icons/naukri.svg",
    color: "bg-[#4A90D9]",
    available: true,
  },
  {
    id: "unstop",
    name: "Unstop",
    description: "Competitions, hackathons, and entry-level opportunities",
    icon: "/icons/unstop.svg",
    color: "bg-[#1C3879]",
    available: true,
  },
  {
    id: "internshala",
    name: "Internshala",
    description: "Internships and fresher jobs across India",
    icon: "/icons/internshala.svg",
    color: "bg-[#00A5EC]",
    available: true,
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    description: "Jobs, salaries, and company reviews",
    icon: "/icons/glassdoor.svg",
    color: "bg-[#0CAA41]",
    available: false,
  },
  {
    id: "ycombinator",
    name: "Y Combinator",
    description: "Jobs at YC-backed startups",
    icon: "/icons/ycombinator.svg",
    color: "bg-[#FF6600]",
    available: true,
  },
];

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("platform_connections")
    .select("*")
    .eq("user_id", user?.id);

  const getConnectionStatus = (platformId: string) => {
    const connection = connections?.find((c) => c.platform === platformId);
    return connection?.status || "disconnected";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Connected
          </span>
        );
      case "expired":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Expired
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            <Link2 className="w-4 h-4" />
            Not Connected
          </span>
        );
    }
  };

  const getLastSynced = (platformId: string) => {
    const connection = connections?.find((c) => c.platform === platformId);
    if (!connection?.last_synced_at) return null;
    return new Date(connection.last_synced_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-700">Platform Connections</h1>
          <p className="text-dark-400">Connect your job platform accounts for seamless applications</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-gold/10 rounded-xl p-5 border border-primary-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-700 mb-1">Why connect platforms?</h3>
            <p className="text-sm text-dark-400">
              Connecting your accounts allows ApplyX to automatically apply to jobs on your behalf,
              import your profile data, and track application status across all platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const status = getConnectionStatus(platform.id);
          const lastSynced = getLastSynced(platform.id);
          const isConnected = status === "connected";

          return (
            <div
              key={platform.id}
              className={`bg-white rounded-xl border border-primary-100 p-5 ${
                !platform.available ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${platform.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xl font-bold">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-dark-700">{platform.name}</h3>
                      <p className="text-sm text-dark-400 mt-0.5">{platform.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {getStatusBadge(status)}

                    {platform.available ? (
                      <div className="flex items-center gap-2">
                        {isConnected && (
                          <button
                            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Sync now"
                          >
                            <RefreshCw className="w-5 h-5 text-dark-400" />
                          </button>
                        )}
                        <button
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            isConnected
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-primary-600 text-white hover:bg-primary-700"
                          }`}
                        >
                          {isConnected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-dark-400">Coming Soon</span>
                    )}
                  </div>

                  {lastSynced && (
                    <p className="text-xs text-dark-300 mt-3">Last synced: {lastSynced}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Stats */}
      <div className="bg-white rounded-xl border border-primary-100 p-5">
        <h3 className="font-semibold text-dark-700 mb-4">Connection Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">
              {connections?.filter((c) => c.status === "connected").length || 0}
            </p>
            <p className="text-sm text-green-700">Connected</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {connections?.filter((c) => c.status === "expired").length || 0}
            </p>
            <p className="text-sm text-yellow-700">Need Refresh</p>
          </div>
          <div className="p-4 bg-primary-50 rounded-xl">
            <p className="text-2xl font-bold text-primary-600">
              {platforms.filter((p) => p.available).length -
                (connections?.filter((c) => c.status === "connected").length || 0)}
            </p>
            <p className="text-sm text-primary-700">Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
