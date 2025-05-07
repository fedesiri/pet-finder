import { Descriptions, Divider, Tag } from "antd";
import { FaBirthdayCake, FaCat, FaDog, FaInfoCircle } from "react-icons/fa";
import { IoMdPaw } from "react-icons/io";

const PetInfoSection = ({ pet }) => {
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
  return (
    <div style={{ marginBottom: "24px" }}>
      <Divider orientation="left">
        <FaInfoCircle style={{ marginRight: 8 }} />
        Información Básica
      </Divider>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Nombre">{pet.name}</Descriptions.Item>
        <Descriptions.Item label="Especie">
          <Tag color={color} icon={<SpeciesIcon />}>
            {label}
          </Tag>
        </Descriptions.Item>
        {pet.breed && <Descriptions.Item label="Raza">{pet.breed}</Descriptions.Item>}
        <Descriptions.Item label="Color">{pet.color}</Descriptions.Item>
        {pet.birthdate && (
          <Descriptions.Item label="Fecha de Nacimiento">
            <FaBirthdayCake style={{ marginRight: 8 }} />
            {new Date(pet.birthdate).toLocaleDateString()}
          </Descriptions.Item>
        )}
        {pet.distinctive_marks && (
          <Descriptions.Item label="Marcas Distintivas">{pet.distinctive_marks}</Descriptions.Item>
        )}
        {pet.pet_code_id && <Descriptions.Item label="ID de Chapita">{pet.pet_code_id}</Descriptions.Item>}
      </Descriptions>
    </div>
  );
};

export default PetInfoSection;
