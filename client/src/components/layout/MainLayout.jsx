import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://images2.alphacoders.com/103/1036128.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
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
      <Footer />
    </Layout>
  );
}
