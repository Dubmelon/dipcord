
import type { Profile as DatabaseProfile } from "./database";

export type Profile = DatabaseProfile;

export interface ProfileResponse {
  data: Profile | null;
  isLoading: boolean;
  error: Error | null;
}
