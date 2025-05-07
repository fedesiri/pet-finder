import { Card, Image, Space, Tag, Tooltip, Typography } from "antd";
import React from "react";
import { FaCat, FaDog, FaPaw, FaQrcode } from "react-icons/fa";
import { IoMdPaw } from "react-icons/io";

const { Text } = Typography;

const PetCard = ({ pet, actions, onClick }) => {
  // Función para obtener el icono y color según la especie
  const getSpeciesInfo = () => {
    switch (pet.species) {
      case "DOG":
        return { icon: FaDog, color: "blue", label: "Perro" };
      case "CAT":
        return { icon: FaCat, color: "orange", label: "Gato" };
      default:
        return { icon: IoMdPaw, color: "purple", label: "Mascota" };
    }
  };

  const { icon: SpeciesIcon, color, label } = getSpeciesInfo();

  // Manejo seguro de fotos
  const getPhotoUrl = () => {
    try {
      const primaryPhoto = pet.photos?.find((p) => p.is_primary) || pet.photos?.[0];
      return primaryPhoto?.url || null;
    } catch (error) {
      console.error("Error processing pet photos:", error);
      return null;
    }
  };

  const photoUrl = getPhotoUrl();

  // Formatear el código de mascota
  const formatPetCode = (id) => {
    if (!id) return null;
    return id.split("-")[0]; // Mostrar solo la primera parte del UUID
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <div
          style={{
            height: "200px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Foto de ${pet.name}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              preview={false}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f2f5",
              }}
            >
              <FaPaw style={{ fontSize: "48px", color: "#999" }} />
            </div>
          )}
        </div>
      }
      actions={actions}
      styles={{ body: { padding: "16px" } }}
    >
      <Card.Meta
        title={
          <Space align="center">
            <Text strong ellipsis style={{ maxWidth: "120px" }}>
              {pet.name}
            </Text>
            <Tag color={color} icon={<SpeciesIcon />}>
              {label}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {pet.breed && (
              <Text ellipsis style={{ maxWidth: "100%" }}>
                {pet.breed}
              </Text>
            )}

            <Text type="secondary">{pet.color}</Text>

            {pet.distinctive_marks && (
              <Tooltip title={pet.distinctive_marks}>
                <Text type="secondary" ellipsis>
                  Marcas: {pet.distinctive_marks}
                </Text>
              </Tooltip>
            )}

            {pet.pet_code_id && (
              <Text>
                <FaQrcode style={{ marginRight: 8 }} />
                <Text code>{formatPetCode(pet.pet_code_id)}</Text>
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default PetCard;
