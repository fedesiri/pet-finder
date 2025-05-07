import { Card, Collapse, Divider, List, Space, Tag, Typography } from "antd";
import { FaEnvelope, FaUser, FaUsers, FaWhatsapp } from "react-icons/fa";
import AddressCard from "../../components/ui/AddressCard";

const { Text } = Typography;

const PetUsersSection = ({ users }) => {
  // Convertimos los usuarios al formato de items que espera Collapse
  const collapseItems = users?.map((user, index) => ({
    key: user.id,
    label: (
      <Space>
        <FaUser />
        {index === 0 && <Tag color="gold">Principal</Tag>}
      </Space>
    ),
    children: (
      <>
        <List itemLayout="horizontal">
          <List.Item>
            <List.Item.Meta avatar={<FaUser />} title="Nombre" description={user.name || "No especificado"} />
          </List.Item>
          <List.Item>
            <List.Item.Meta avatar={<FaEnvelope />} title="Email" description={user.email || "No especificado"} />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={<FaWhatsapp />}
              title="Teléfono"
              description={
                user.phone ? (
                  <a href={`https://wa.me/${user.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    {user.phone}
                  </a>
                ) : (
                  "No especificado"
                )
              }
            />
          </List.Item>
        </List>

        <Divider orientation="left">Direcciones</Divider>

        {user.addresses.length > 0 ? (
          user.addresses.map((address) => (
            <AddressCard key={address.id} address={address} bordered={false} hoverable={false} />
          ))
        ) : (
          <Text type="secondary">No hay direcciones registradas</Text>
        )}
      </>
    ),

    showArrow: true,
  }));

  return (
    <Card
      title={
        <Space>
          <FaUsers />
          <span>Dueños ({users?.length || 0})</span>
        </Space>
      }
      style={{ marginBottom: "24px" }}
    >
      {users?.length === 0 ? (
        <Text type="secondary">No se registraron dueños</Text>
      ) : (
        <Collapse
          ghost
          items={collapseItems.map((item) => ({
            ...item,
            children: <div style={{ maxHeight: "auto", overflowY: "auto" }}>{item.children}</div>,
          }))}
        />
      )}
    </Card>
  );
};

export default PetUsersSection;
