import { Admin, Resource, ListGuesser } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import authProvider from "./authProvider";
import LoginPage from "./LoginPage";

const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

const AdminApp = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    loginPage={LoginPage}
  >
    <Resource name="posts" list={ListGuesser} />
    <Resource name="users" list={ListGuesser} />
  </Admin>
);

export default AdminApp;