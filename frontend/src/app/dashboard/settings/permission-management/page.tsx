import { adminGetPermissionsAction } from "../../../../lib/actions";
import PermissionManagementClientView from "./PermissionManagementClientView";

export default async function PermissionManagementPage() {
  const permissions = await adminGetPermissionsAction();

  return <PermissionManagementClientView initialPermissions={permissions || []} />;
}
