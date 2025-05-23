import { Button, Space } from "antd";
import { FaQrcode, FaSync } from "react-icons/fa";

const PetActionButtons = ({ pet, onViewQR, onRefresh }) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {pet.pet_code_id && (
        <Button type="primary" icon={<FaQrcode />} onClick={onViewQR} block style={{ marginBottom: "8px" }}>
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
