import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default function AuthLayout() {
  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Content
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
