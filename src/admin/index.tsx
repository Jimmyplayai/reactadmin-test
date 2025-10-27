import { Admin, Resource, ListGuesser } from "react-admin";
import dataProvider from "./dataProvider";
import authProvider from "./authProvider";
import LoginPage from "./LoginPage";

const AdminApp = () => (
  <Admin
    basename="/admin"
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={LoginPage}
  >
    <Resource name="posts" list={ListGuesser} />
    <Resource name="users" list={ListGuesser} />
  </Admin>
);

export default AdminApp;