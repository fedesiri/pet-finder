import { MailOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import dayjs from "dayjs";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const { Footer: AntFooter } = Layout;

export default function Footer() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <AntFooter
      style={{
        background:  isLandingPage ? "transparent" : "#000" ,
        color: "white",
        padding: "20px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h3>Contacto</h3>
        <div style={{ fontSize: "24px", margin: "16px 0" }}>
          <a href="mailto:info@tudominio.com" style={{ color: "white", margin: "0 16px" }}>
            <MailOutlined />
          </a>
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", margin: "0 16px" }}
          >
            <FaWhatsapp />
          </a>
          <a
            href="https://instagram.com/tucuenta"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", margin: "0 16px" }}
          >
            <FaInstagram />
          </a>
        </div>
      </div>
      <p>© {dayjs().year()} EncontraYaco. Todos los derechos reservados.</p>
    </AntFooter>
  );
}
