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
  Spin,
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
import { useUserProfile } from "../../hooks/useUserProfile";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const [hasPets] = useState(false);
  const { logout } = useContext(AuthContext);
  const { userData, loading, error } = useUserProfile();
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

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <div>Error al cargar el perfil: {error.message}</div>;
  }

  if (!userData) {
    return <div>No se encontraron datos del perfil</div>;
  }

  return (
    <>
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
                <Avatar src={userData?.photoURL} icon={<FaUser />} />
                <Text strong>{userData?.name?.split(" ")[0] || userData?.email?.split("@")[0]}</Text>
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
                  <List.Item.Meta avatar={<FaIdCard />} title="Nombre completo" description={`${userData.name}`} />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta avatar={<FaEnvelope />} title="Email" description={userData.email} />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta avatar={<FaPhone />} title="Teléfono" description={userData.phone} />
                  <Button type="text" icon={<FaEdit />} />
                </List.Item>
              </List>

              <Divider orientation="left" plain>
                <FaHome style={{ marginRight: 8 }} /> Direcciones
              </Divider>

              <Row gutter={[16, 16]}>
                {userData.addresses.map((address) => (
                  <Col xs={24} sm={12} key={address.id}>
                    <Card extra={address.is_primary && <Tag color="green">Principal</Tag>}>
                      <Space direction="vertical">
                        <Text strong>
                          <FaMapMarkerAlt style={{ marginRight: 8 }} />
                          {address.street} {address.number} {address.apartment && `, ${address.apartment}`}
                        </Text>
                        <Text>
                          <FaThumbtack style={{ marginRight: 8 }} />
                          {address.neighborhood ? `${address.neighborhood}, ` : ""}
                          {address.locality}, {address.province}
                        </Text>
                        <Text type="secondary">CP: {address.zip_code ? address.zip_code : "N/A"}</Text>
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
                {userData?.pets?.map((pet) => (
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
