import { adminGetUsersAction } from "../../../../lib/actions";
import UserManagementClientView from "./UserManagementClientView";

export default async function UserManagementPage() {
  const users = await adminGetUsersAction();

  return <UserManagementClientView initialUsers={users || []} />;
}
