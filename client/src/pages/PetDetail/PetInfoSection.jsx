import { Button, Descriptions, Divider, Space, Tag } from "antd";
import { FaBirthdayCake, FaCat, FaDog, FaEdit, FaInfoCircle } from "react-icons/fa";
import { IoMdPaw } from "react-icons/io";

const PetInfoSection = ({ pet, onEditField }) => {
  const getSpeciesInfo = () => {
    switch (pet.species) {
      case "DOG":
        return { icon: FaDog, color: "blue", label: "Perro" };
      case "CAT":
        return { icon: FaCat, color: "orange", label: "Gato" };
      default:
        return { icon: IoMdPaw, color: "purple", label: "Otra" };
    }
  };

  const { icon: SpeciesIcon, color, label } = getSpeciesInfo();

  const renderEditableField = (field, value, extra = null) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
      <Space>
        {extra}
        {value || "No especificado"}
      </Space>
      <Button type="text" icon={<FaEdit />} size="small" onClick={() => onEditField(field, value)} />
    </div>
  );

  return (
    <div style={{ marginBottom: "24px" }}>
      <Divider orientation="left">
        <FaInfoCircle style={{ marginRight: 8 }} />
        Información Básica
      </Divider>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Nombre">{renderEditableField("name", pet.name)}</Descriptions.Item>

        <Descriptions.Item label="Especie">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Tag color={color} icon={<SpeciesIcon />}>
              {label}
            </Tag>
            <Button type="text" icon={<FaEdit />} size="small" onClick={() => onEditField("species", label)} />
          </div>
        </Descriptions.Item>

        {pet.breed && <Descriptions.Item label="Raza">{renderEditableField("breed", pet.breed)}</Descriptions.Item>}

        <Descriptions.Item label="Color">{renderEditableField("color", pet.color)}</Descriptions.Item>

        {pet.birthdate && (
          <Descriptions.Item label="Fecha de Nacimiento">
            {renderEditableField(
              "birthdate",
              new Date(pet.birthdate).toLocaleDateString(),
              <FaBirthdayCake style={{ marginRight: 8 }} />
            )}
          </Descriptions.Item>
        )}

        {pet.distinctive_marks && (
          <Descriptions.Item label="Marcas Distintivas">
            {renderEditableField("distinctive_marks", pet.distinctive_marks)}
          </Descriptions.Item>
        )}

        {pet.pet_code_id && <Descriptions.Item label="ID de Chapita">{pet.pet_code_id}</Descriptions.Item>}
      </Descriptions>
    </div>
  );
};

export default PetInfoSection;
