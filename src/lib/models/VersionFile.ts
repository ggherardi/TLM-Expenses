export type PlatformVersionInfo = {
  latest_version: string;
  min_supported_version: string;
  force_update: boolean;
  store_url: string;
  message: string;
  changelog: string[];
};

export type VersionFile = {
  version_schema: number;
  global_message: string | null;
  maintenance: {
    enabled: boolean;
    message: string;
  };
  ios: PlatformVersionInfo;
  android: PlatformVersionInfo;
};
