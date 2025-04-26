import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  List,
  Menu,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import React, { useContext, useState } from "react";
import {
  FaBell,
  FaCog,
  FaEdit,
  FaEnvelope,
  FaHome,
  FaIdCard,
  FaMapMarkerAlt,
  FaPaw,
  FaPhone,
  FaPlus,
  FaQrcode,
  FaSignOutAlt,
  FaThumbtack,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PetCard from "../../components/ui/PetCard";
import { AuthContext } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data basado en tus modelos Prisma
const mockUser = {
  id: "user-123",
  name: "María",
  lastName: "González",
  email: "maria@ejemplo.com",
  phone: "+54 11 1234-5678",
  external_id: "firebase-uid-123",
  addresses: [
    {
      id: "addr-123",
      street: "Av. Corrientes",
      number: "1234",
      apartment: "A",
      neighborhood: "Balvanera",
      zip_code: "C1043",
      is_primary: true,
      province: { name: "Buenos Aires" },
      locality: { name: "CABA" },
    },
    {
      id: "addr-124",
      street: "Av. Santa Fe",
      number: "5678",
      apartment: "B",
      neighborhood: "Recoleta",
      zip_code: "C1123",
      is_primary: false,
      province: { name: "Buenos Aires" },
      locality: { name: "CABA" },
    },
  ],
  pets: [
    {
      id: "pet-123",
      name: "Yaco",
      species: "DOG",
      breed: "Yack Rusell",
      color: "Blanco, Marrón",
      birthdate: "2020-05-15",
      pet_code: { id: "QR-Yaco-123" },
      photos: [{ url: "https://placedog.net/300/200?random=5", is_primary: true }],
    },
    {
      id: "pet-124",
      name: "Ciro",
      species: "DOG",
      breed: "Yack Rusell",
      color: "Blanco, Marrón",
      birthdate: "2020-05-15",
      pet_code: { id: "QR-ciro-123" },
      photos: [{ url: "https://placedog.net/300/200?random=6", is_primary: true }],
    },
  ],
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const [hasPets] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userMenu = (
    <Menu
      items={[
        {
          key: "home",
          icon: <FaHome style={{ marginRight: "8px" }} />,
          label: "Home",
          onClick: () => navigate("/home"),
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
            logout();
            navigate("/");
          },
        },
      ]}
    />
  );

  return (
    <>
      {/* Header consistente con Home */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Title level={3}>
            <Space>
              <FaUser />
              Mi Perfil
            </Space>
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Button type="primary" icon={<FaPlus />} onClick={() => navigate("/register-pet")}>
              Nueva mascota
            </Button>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={user?.photoURL} icon={<FaUser />} />
                <Text strong>{user?.displayName || user?.email?.split("@")[0]}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* Contenido principal */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <FaUser style={{ marginRight: 8 }} />
                Mis Datos
              </span>
            }
            key="data"
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    avatar={<FaIdCard />}
                    title="Nombre completo"
                    description={`${mockUser.name} ${mockUser.lastName}`}
                  />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta avatar={<FaEnvelope />} title="Email" description={mockUser.email} />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta avatar={<FaPhone />} title="Teléfono" description={mockUser.phone} />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
              </List>

              <Divider orientation="left" plain>
                <FaHome style={{ marginRight: 8 }} /> Direcciones
              </Divider>

              <Row gutter={[16, 16]}>
                {mockUser.addresses.map((address) => (
                  <Col xs={24} sm={12} key={address.id}>
                    <Card extra={address.is_primary && <Tag color="green">Principal</Tag>}>
                      <Space direction="vertical">
                        <Text strong>
                          <FaMapMarkerAlt style={{ marginRight: 8 }} />
                          {address.street} {address.number} {address.apartment && `, ${address.apartment}`}
                        </Text>
                        <Text>
                          <FaThumbtack style={{ marginRight: 8 }} />
                          {address.neighborhood}, {address.locality.name}, {address.province.name}
                        </Text>
                        <Text type="secondary">CP: {address.zip_code}</Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Button type="dashed" block icon={<FaPlus />}>
                Agregar dirección
              </Button>
            </Space>
          </TabPane>

          <TabPane
            tab={
              <span>
                <FaPaw style={{ marginRight: 8 }} />
                Mis Mascotas
              </span>
            }
            key="pets"
          >
            {hasPets ? (
              <Row gutter={[16, 16]}>
                {mockUser.pets.map((pet) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={pet.id}>
                    <PetCard
                      pet={pet}
                      actions={[
                        <Button type="link" icon={<FaEdit />}>
                          Editar
                        </Button>,
                        <Button type="link" icon={<FaQrcode />}>
                          QR
                        </Button>,
                      ]}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size="middle">
                    <Text>Todavía no has registrado tu mascota</Text>
                    <Text type="secondary">¿Ya tenés tu chapita identificadora?</Text>
                    <Space>
                      <Button type="primary" icon={<FaPaw />}>
                        Ya tengo mi chapita
                      </Button>
                      <Button icon={<FaQrcode />}>Enviame mi chapita</Button>
                    </Space>
                  </Space>
                }
              />
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <Badge count={0} offset={[8, -5]}>
                  <FaBell style={{ marginRight: 8 }} />
                  Notificaciones
                </Badge>
              </span>
            }
            key="notifications"
          >
            {/* Contenido de notificaciones */}
          </TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default ProfilePage;
