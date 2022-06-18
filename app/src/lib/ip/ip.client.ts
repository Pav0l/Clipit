import { HttpClient, RawResponse } from "../http-client/http-client";

export interface IpApiClient {
  query: () => Promise<RawResponse<IpApiResponse>>;
}

export class IpApi implements IpApiClient {
  constructor(private httpClient: HttpClient) {}

  query = async () => {
    return this.httpClient.requestRaw<IpApiResponse>({
      method: "get",
      url: "/json",
    });
  };
}

interface IpApiResponse {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  languages: string;
  asn: string;
  org: string;
}
