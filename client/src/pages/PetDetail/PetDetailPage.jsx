import { Alert, Avatar, Col, Dropdown, Row, Space, Spin, Typography } from "antd";
import React, { useContext } from "react";
import { FaCog, FaHome, FaPaw, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { usePetDetail } from "../../hooks/usePetDetail";
import PetActionButtons from "./PetActionButons";
import PetInfoSection from "./PetInfoSection";
import PetPhotosGallery from "./PetPhotosGalery";
import PetUsersSection from "./PetUsersSection";

const PetDetailPage = () => {
  const { pet, loading, error, refreshData } = usePetDetail();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const { Title, Text } = Typography;

  const userMenu = {
    items: [
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
    ],
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Spin size="large" tip="Cargando información de la mascota..." fullscreen />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="Error" description={error.message} showIcon style={{ margin: "2rem" }} />;
  }

  if (!pet) {
    return (
      <Alert
        type="warning"
        message="Advertencia"
        description="No se encontró la mascota solicitada"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Title level={3}>
            <Space>
              <FaPaw />
              Detalle de tu mascota {pet.displayName}
            </Space>
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={user.photoURL} icon={<FaUser />} />
                <Text strong>{user.displayName || user.email.split("@")[0]}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={16}>
          <PetInfoSection pet={pet} />
          <PetPhotosGallery photos={pet.photos} />
        </Col>

        <Col xs={24} md={8}>
          <PetUsersSection users={pet.users} />
          <PetActionButtons
            pet={pet}
            onEdit={() => navigate(`/pets/${pet.id}/edit`)}
            onViewQR={() => navigate(`/pets/${pet.id}/qr`)}
            onRefresh={refreshData}
          />
        </Col>
      </Row>
    </div>
  );
};

export default PetDetailPage;
