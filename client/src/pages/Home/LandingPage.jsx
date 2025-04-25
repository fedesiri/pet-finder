import { LoginOutlined, SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import PetLogo from "../../components/ui/PetLogo";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Card
        style={{
          width: 300,
          marginBottom: 40,
          textAlign: "center",
          border: "none",
          backgroundColor: "transparent",
        }}
        variant={false}
      >
        {/* <Image src="/images/logo-mascotas.png" alt="Pet Finder Logo" preview={false} width={200} /> */}
        <PetLogo />
      </Card>

      {/* Botones */}
      <div style={{ width: "100%", maxWidth: 300 }}>
        <Button
          type="default"
          icon={<SearchOutlined />}
          size="large"
          block
          style={{ marginBottom: 16, height: 50 }}
          onClick={() => navigate("/found-pet")}
        >
          ENCONTRÉ UNA MASCOTA
        </Button>

        <Button
          type="default"
          icon={<LoginOutlined />}
          size="large"
          block
          style={{ marginBottom: 16, height: 50 }}
          onClick={() => navigate("/login")}
        >
          INICIAR SESIÓN
        </Button>

        <Button
          type="default"
          icon={<ShoppingCartOutlined />}
          size="large"
          block
          style={{ height: 50 }}
          onClick={() => navigate("/make-order")}
        >
          HACER UN PEDIDO
        </Button>
      </div>
    </>
  );
}
