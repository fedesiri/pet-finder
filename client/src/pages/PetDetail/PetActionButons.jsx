import { Button, Space } from "antd";
import { FaEdit, FaQrcode, FaSync } from "react-icons/fa";

const PetActionButtons = ({ pet, onEdit, onViewQR, onRefresh }) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Button type="primary" icon={<FaEdit />} onClick={onEdit} block style={{ marginBottom: "8px" }}>
        Editar Mascota
      </Button>

      {pet.pet_code_id && (
        <Button icon={<FaQrcode />} onClick={onViewQR} block style={{ marginBottom: "8px" }}>
          Ver Código QR
        </Button>
      )}

      <Button icon={<FaSync />} onClick={onRefresh} block>
        Actualizar Datos
      </Button>
    </Space>
  );
};

export default PetActionButtons;
