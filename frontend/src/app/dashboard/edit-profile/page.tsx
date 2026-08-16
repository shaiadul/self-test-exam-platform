import { getProfileAction, getSystemAssetsAction } from "../../../lib/actions";
import EditProfileClientView from "./EditProfileClientView";

export default async function EditProfilePage() {
  const [profile, assets] = await Promise.all([
    getProfileAction(),
    getSystemAssetsAction(),
  ]);

  return <EditProfileClientView initialProfile={profile} initialAssets={assets || []} />;
}
