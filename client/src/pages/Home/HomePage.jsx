import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Empty,
  Menu,
  Pagination,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import * as dayjs from "dayjs";
import React, { useContext, useEffect } from "react";
import { FaCog, FaPaw, FaPlus, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LostPetsFilters from "../../components/LostPetsFilters";
import { AuthContext } from "../../context/AuthContext";
import { useLostPets } from "../../hooks/useLostPets";
import { useUserProfile } from "../../hooks/useUserProfile";

const { Title, Text } = Typography;

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const { userData } = useUserProfile();

  const navigate = useNavigate();
  const {
    data: lostPets = [],
    loading,
    pagination,
    changePage,
    handleFilterChange,
    filters,
    resetFilters,
  } = useLostPets();

  const userLocation = userData?.addresses[0];

  useEffect(() => {
    if (userLocation) {
      handleFilterChange("province_id", userLocation?.province_id);
      handleFilterChange("locality_id", userLocation?.locality_id);
    }
  }, [userLocation]);

  if (!user || loading) {
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
            logout();
            navigate("/");
          },
        },
      ]}
    />
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
          <Col>
            <Title level={3}>
              <Space>
                <FaPaw />
                Mascotas perdidas cerca de ti
              </Space>
            </Title>
          </Col>
          <Col>
            <Space size="middle">
              <Button type="primary" icon={<FaPlus />} onClick={() => navigate("/report-pet")}>
                Reportar mascota
              </Button>
              <Dropdown menu={userMenu} placement="bottomRight">
                <Space style={{ cursor: "pointer" }}>
                  <Avatar src={user.photoURL} icon={<FaUser />} />
                  <Text strong>{user.displayName || user.email.split("@")[0]}</Text>
                </Space>
              </Dropdown>
            </Space>
          </Col>
        </Row>

        <LostPetsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          userLocation={userLocation}
        />

        {/* Listado de mascotas perdidas */}
        {lostPets.length === 0 ? (
          <Card style={{ marginBottom: 24 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  {Object.values(filters).filter(Boolean).length > 0
                    ? `No hay mascotas perdidas en la zona que coincidan con tu búsqueda`
                    : "No hay mascotas perdidas reportadas en tu zona"}
                </span>
              }
            >
              {Object.values(filters).filter(Boolean).length > 0 && (
                <Button type="primary" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {lostPets.map((report) => (
              <Col key={report.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/lost-pets/${report.pet.id}`)}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  bodyStyle={{
                    padding: 16,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  cover={
                    <div
                      style={{
                        height: "200px",
                        overflow: "hidden",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <img
                        alt={report.pet.name}
                        src={report.pet.photo_url || "https://via.placeholder.com/300?text=Sin+imagen"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300?text=Imagen+no+disponible";
                          e.target.style.opacity = "0.8";
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Text strong style={{ fontSize: 18 }}>
                        {report.pet.name}
                      </Text>
                    }
                    description={
                      <div style={{ flexGrow: 1 }}>
                        <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                          {report.pet.breed}
                        </Text>
                        <Divider style={{ margin: "12px 0" }} />
                        <Text strong>Última vez visto: </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(report.last_seen_date).format("DD/MM/YYYY")}
                        </Text>
                        <Text style={{ display: "block", marginBottom: 8 }}>{report.last_seen_address}</Text>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Mostrar paginación solo si hay resultados */}
      {lostPets.length > 0 && (
        <Row
          justify="center"
          style={{
            padding: "24px 0",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Pagination
            current={pagination.page}
            pageSize={pagination.items_per_page}
            total={pagination.total_items}
            onChange={changePage}
            showSizeChanger
            pageSizeOptions={["10", "20", "30", "40"]}
          />
        </Row>
      )}
    </div>
  );
};

export default HomePage;
