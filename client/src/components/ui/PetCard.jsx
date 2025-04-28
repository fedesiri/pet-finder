import { Card, Image, Space, Tag, Typography } from "antd";
import React from "react";
import { FaCat, FaDog, FaPaw, FaQrcode } from "react-icons/fa";

const { Text } = Typography;

const PetCard = ({ pet, actions }) => {
  // Función para obtener el icono según la especie
  const getSpeciesIcon = () => {
    switch (pet.species) {
      case "DOG":
        return FaDog;
      case "CAT":
        return FaCat;
      default:
        return FaPaw;
    }
  };

  const SpeciesIcon = getSpeciesIcon();

  // Verificar si hay fotos y obtener la primaria o la primera
  const primaryPhoto = pet.photos?.find((p) => p.is_primary) || pet.photos?.[0];
  const photoUrl = primaryPhoto?.url || "https://placekitten.com/300/200";

  return (
    <Card
      cover={
        <div style={{ height: "200px", overflow: "hidden" }}>
          <Image
            src={photoUrl}
            alt={pet.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            placeholder={
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
            }
          />
        </div>
      }
      actions={actions}
    >
      <Card.Meta
        title={
          <Space>
            <Text strong>{pet.name}</Text>
            <Tag
              color={pet.species === "DOG" ? "blue" : pet.species === "CAT" ? "orange" : "green"}
              icon={<SpeciesIcon />}
            >
              {pet.species === "DOG" ? "Perro" : pet.species === "CAT" ? "Gato" : "Otro"}
            </Tag>
          </Space>
        }
        description={
          <Space direction="vertical" size="small">
            {pet.breed && <Text>{pet.breed}</Text>}
            <Text type="secondary">{pet.color}</Text>
            {pet.pet_code && (
              <Text>
                <FaQrcode style={{ marginRight: 8 }} />
                Código: {pet.pet_code.id}
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default PetCard;
