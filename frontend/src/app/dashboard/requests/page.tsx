import { getProfileAction } from "../../../lib/actions/auth";
import { getRequestsAction } from "../../../lib/actions/requests";
import { getExamPacksAction } from "../../../lib/actions/examPacks";
import RequestsClientView from "./RequestsClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RequestsPage() {
  const [profile, requests, packs] = await Promise.all([
    getProfileAction(),
    getRequestsAction(),
    getExamPacksAction(),
  ]);

  return (
    <RequestsClientView
      profile={profile}
      initialRequests={requests}
      packs={packs}
    />
  );
}
