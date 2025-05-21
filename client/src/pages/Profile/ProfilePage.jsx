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
  message,
  Row,
  Space,
  Spin,
  Tabs,
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
  FaPaw,
  FaPhone,
  FaPlus,
  FaQrcode,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EditFieldModal from "../../components/profile/EditFieldModal";
import RequestTagModal from "../../components/RequestTagModal";
import AddressCard from "../../components/ui/AddressCard";
import PetCard from "../../components/ui/PetCard";
import { AuthContext } from "../../context/AuthContext";
import { usePetsFromUser } from "../../hooks/usePetsFromUser";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useUserProfile } from "../../hooks/useUserProfile";
import { translateError } from "../../utils/errors-translations";

const { Title, Text } = Typography;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("pets");
  const { logout, user } = useContext(AuthContext);
  const token = user?.accessToken;
  const {
    userData,
    loading,
    error,
    addresses,
    loading: addressesLoading,
    setUserData,
    refreshProfile,
  } = useUserProfile();
  const { pets, loading: petsLoading, error: petsError } = usePetsFromUser();
  const navigate = useNavigate();
  const [requestTagModalVisible, setRequestTagModalVisible] = useState(false);
  const [editingState, setEditingState] = useState({
    visible: false,
    field: null,
    currentValue: "",
  });
  const [messageApi, contextHolder] = message.useMessage();
  const { updateUserData, isLoading: isUpdating } = useUpdateUser();

  const getFieldTitle = (field) => {
    const titles = {
      name: "Nombre completo",
      email: "Email",
      phone: "Teléfono",
    };
    return titles[field] || field;
  };

  const handleEditClick = (field, currentValue) => {
    setEditingState({
      visible: true,
      field,
      currentValue,
    });
  };

  const handleSave = async (newValue) => {
    if (newValue !== editingState.currentValue) {
      const result = await updateUserData(token, {
        [editingState.field]: newValue,
      });

      if (result.success) {
        const updatedField = Object.keys(result.updatedFields)[0];
        const updatedValue = result.updatedFields[updatedField];
        setUserData((prev) => ({
          ...prev,
          [updatedField]: updatedValue,
        }));

        messageApi.open({
          type: "success",
          content: "Datos actualizados correctamente!",
        });

        setEditingState({ visible: false, field: null, currentValue: "" });
        refreshProfile();
      } else {
        const userFriendlyMessage = translateError(result.error);
        messageApi.open({
          type: "error",
          content: userFriendlyMessage,
          duration: 5,
        });
      }
    } else {
      setEditingState({ visible: false, field: null, currentValue: "" });
    }
  };

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

  const renderPetsContent = () => {
    if (petsLoading) {
      return <Spin tip="Cargando mascotas..." fullscreen />;
    }

    if (petsError) {
      return <Empty description={<Text type="danger">Error al cargar las mascotas: {petsError.message}</Text>} />;
    }

    if (!pets || pets.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="middle">
              <Text>Todavía no has registrado tu mascota</Text>
              <Text type="secondary">¿Ya tenés tu chapita identificadora?</Text>
              <Space>
                <Button icon={<FaQrcode />} onClick={() => setRequestTagModalVisible(true)}>
                  Enviame mi chapita
                </Button>
              </Space>
            </Space>
          }
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {pets.map((pet) => (
          <Col xs={24} sm={12} md={8} lg={6} key={pet.id}>
            <PetCard
              pet={{
                ...pet,
                photo: pet.photos?.find((p) => p.is_primary)?.url || pet.photos?.[0]?.url,
              }}
              onClick={() => navigate(`/pets/${pet.id}`)}
              actions={[
                <Button key="edit" type="link" icon={<FaEdit />} onClick={() => navigate(`/edit-pet/${pet.id}`)}>
                  Editar
                </Button>,
                <Button key="qr" type="link" icon={<FaQrcode />} onClick={() => navigate(`/pet-qr/${pet.pet_code_id}`)}>
                  QR
                </Button>,
              ]}
            />
          </Col>
        ))}
      </Row>
    );
  };

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <div>Error al cargar el perfil: {error.message}</div>;
  }

  if (!userData) {
    return <div>No se encontraron datos del perfil</div>;
  }

  const renderFieldItem = (field, value, icon) => (
    <List.Item>
      <List.Item.Meta avatar={icon} title={getFieldTitle(field)} description={value || "No especificado"} />
      <Button type="text" icon={<FaEdit />} onClick={() => handleEditClick(field, value)} />
    </List.Item>
  );

  const tabItems = [
    {
      key: "data",
      label: (
        <span>
          <FaUser style={{ marginRight: 8 }} />
          Mis Datos
        </span>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <List itemLayout="horizontal">
            {renderFieldItem("name", userData.name, <FaIdCard />)}
            {renderFieldItem("email", userData.email, <FaEnvelope />)}
            {renderFieldItem("phone", userData.phone, <FaPhone />)}
          </List>

          <Divider orientation="left" plain>
            <FaHome style={{ marginRight: 8 }} /> Direcciones
          </Divider>

          <Row gutter={[16, 16]}>
            {userData.addresses.map((address) => (
              <Col xs={24} sm={12} key={address.id}>
                <AddressCard address={address} extraActions={<Button type="text" icon={<FaEdit />} />} />
              </Col>
            ))}
          </Row>

          <Button type="dashed" block icon={<FaPlus />}>
            Agregar dirección
          </Button>
        </Space>
      ),
    },
    {
      key: "pets",
      label: (
        <span>
          <FaPaw style={{ marginRight: 8 }} />
          Mis Mascotas
        </span>
      ),
      children: renderPetsContent(),
    },
    {
      key: "notifications",
      label: (
        <span>
          <Badge count={0} offset={[8, -5]}>
            <FaBell style={{ marginRight: 8 }} />
            Notificaciones
          </Badge>
        </span>
      ),
      children: null, // Contenido de notificaciones
    },
  ];

  return (
    <>
      {contextHolder}
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
            <Button type="primary" icon={<FaPlus />} onClick={() => setRequestTagModalVisible(true)}>
              Nueva chapita
            </Button>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar src={userData?.photoURL} icon={<FaUser />} />
                <Text strong>{userData?.name?.split(" ")[0] || userData?.email?.split("@")[0]}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
      <RequestTagModal
        visible={requestTagModalVisible}
        onCancel={() => setRequestTagModalVisible(false)}
        userAddresses={addresses}
        loading={addressesLoading}
      />
      <EditFieldModal
        visible={editingState.visible}
        field={editingState.field}
        currentValue={editingState.currentValue}
        onCancel={() =>
          setEditingState({
            visible: false,
            field: null,
            currentValue: "",
          })
        }
        onSave={handleSave}
        loading={isUpdating}
      />
    </>
  );
};

export default ProfilePage;
