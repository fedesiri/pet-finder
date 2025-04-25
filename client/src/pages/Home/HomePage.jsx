import { Avatar, Button, Card, Col, Divider, Dropdown, Menu, Row, Space, Spin, Typography } from "antd";
import React, { useContext } from "react";
import { FaCog, FaPaw, FaPlus, FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const { Title, Text } = Typography;

// Datos mockeados (simulando tu modelo LostReport y Pet)
const mockLostPets = [
  {
    id: "1",
    pet: {
      name: "Max",
      species: "DOG",
      breed: "Golden Retriever",
      photoUrl: "https://placedog.net/300/200?random=1",
    },
    lastSeenAddress: "Av. Siempreviva 742, Springfield",
    lastSeenDate: "2023-10-25T12:00:00Z",
    isActive: true,
  },
  {
    id: "2",
    pet: {
      name: "Luna",
      species: "CAT",
      breed: "Siamés",
      photoUrl: "https://placedog.net/300/200?random=2",
    },
    lastSeenAddress: "Calle Falsa 123, Shelbyville",
    lastSeenDate: "2023-10-24T10:30:00Z",
    isActive: true,
  },
  {
    id: "3",
    pet: {
      name: "Max",
      species: "DOG",
      breed: "Golden Retriever",
      photoUrl: "https://placedog.net/300/200?random=3",
    },
    lastSeenAddress: "Av. Siempreviva 742, Springfield",
    lastSeenDate: "2023-10-25T12:00:00Z",
    isActive: true,
  },
  {
    id: "4",
    pet: {
      name: "Luna",
      species: "CAT",
      breed: "Siamés",
      photoUrl: "https://placedog.net/300/200?random=4",
    },
    lastSeenAddress: "Calle Falsa 123, Shelbyville",
    lastSeenDate: "2023-10-24T10:30:00Z",
    isActive: true,
  },
  {
    id: "5",
    pet: {
      name: "Max",
      species: "DOG",
      breed: "Golden Retriever",
      photoUrl: "https://placedog.net/300/200?random=5",
    },
    lastSeenAddress: "Av. Siempreviva 742, Springfield",
    lastSeenDate: "2023-10-25T12:00:00Z",
    isActive: true,
  },
  {
    id: "6",
    pet: {
      name: "Luna",
      species: "CAT",
      breed: "Siamés",
      photoUrl: "https://placedog.net/300/200?random=6",
    },
    lastSeenAddress: "Calle Falsa 123, Shelbyville",
    lastSeenDate: "2023-10-24T10:30:00Z",
    isActive: true,
  },
];

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <Spin fullscreen />;
  }

  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          icon: <FaUser style={{ marginRight: "8px" }} />,
          label: "Mi perfil",
          onClick: () => navigate("/profile"),
        },
        {
          key: "settings",
          icon: <FaCog style={{ marginRight: "8px" }} />,
          label: "Configuración",
        },
        {
          type: "divider",
        },
        {
          key: "logout",
          icon: <FaSignOutAlt style={{ marginRight: "8px" }} />,
          label: "Cerrar sesión",
          onClick: () => {
            logout(); // Llama a la función de logout
            navigate("/"); // Redirige al login
          },
        },
      ]}
    />
  );

  return (
    <div style={{ padding: "24px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Title level={3}>
            <Space>
              <FaPaw /> {/* Icono de mascota */}
              Mascotas perdidas cerca de ti
            </Space>
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Button
              type="primary"
              icon={<FaPlus />} // Icono de FontAwesome
              onClick={() => navigate("/report-pet")}
            >
              Reportar mascota
            </Button>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  src={user.photoURL}
                  icon={<FaUser />} // Icono de FontAwesome
                />
                <Text strong>{user.displayName || user.email.split("@")[0]}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* Barra de búsqueda (opcional) */}
      <Row style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Button icon={<FaSearch />} block style={{ textAlign: "left" }}>
            Buscar por ubicación, raza o nombre...
          </Button>
        </Col>
      </Row>

      {/* Listado de mascotas perdidas */}
      <Row gutter={[16, 16]}>
        {mockLostPets.map((report) => (
          <Col key={report.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              cover={
                <img alt={report.pet.name} src={report.pet.photoUrl} style={{ height: "160px", objectFit: "cover" }} />
              }
              actions={[
                <Button type="link" block>
                  Ver detalles
                </Button>,
              ]}
            >
              <Card.Meta
                title={report.pet.name}
                description={
                  <>
                    <Text type="secondary">{report.pet.breed}</Text>
                    <Divider style={{ margin: "8px 0" }} />
                    <Text strong>Última vez visto:</Text>
                    <Text block>{report.lastSeenAddress}</Text>
                    <Text type="secondary">{new Date(report.lastSeenDate).toLocaleDateString()}</Text>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;
