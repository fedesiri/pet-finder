import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";

const { Content } = Layout;

export default function AuthLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Content
        style={
          isAuthPage
            ? {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }
            : {
                padding: "24px",
                maxWidth: "1400px",
                margin: "0 auto",
                width: "100%",
              }
        }
      >
        <Outlet />
      </Content>
    </Layout>
  );
}
