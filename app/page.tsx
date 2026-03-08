import { normalizeDoodleProviderName } from "@/lib/doodle/provider-options";
import { DoodlePlayground } from "@/components/doodle-playground";

export default function HomePage() {
  return <DoodlePlayground defaultProvider={normalizeDoodleProviderName(process.env.DOODLE_PROVIDER) || "mock"} />;
}
