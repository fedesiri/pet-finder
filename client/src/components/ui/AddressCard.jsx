import { Button, Card, Space, Tag, Typography } from "antd";
import { FaEdit, FaHome, FaMapMarkerAlt, FaThumbtack } from "react-icons/fa";

const { Text } = Typography;

const AddressCard = ({ address, onEdit = null, showEditButton = true, cardStyle = {} }) => {
  return (
    <Card
      hoverable
      style={{ marginBottom: 16, ...cardStyle }}
      title={
        <Space>
          <FaHome />
          <span>Dirección</span>
          {address.is_primary && <Tag color="green">Principal</Tag>}
        </Space>
      }
      extra={showEditButton && onEdit && <Button type="text" icon={<FaEdit />} onClick={() => onEdit(address.id)} />}
    >
      <Space direction="vertical" size="small">
        <Text strong>
          <FaMapMarkerAlt style={{ marginRight: 8 }} />
          {address.street} {address.number}
          {address.apartment && `, ${address.apartment}`}
        </Text>

        <Text>
          <FaThumbtack style={{ marginRight: 8 }} />
          {address.neighborhood && `${address.neighborhood}, `}
          {address.locality}, {address.province}
        </Text>

        <Text type="secondary">Código Postal: {address.zip_code || "N/A"}</Text>
      </Space>
    </Card>
  );
};

export default AddressCard;
