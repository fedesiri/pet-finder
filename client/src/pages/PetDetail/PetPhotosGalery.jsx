import { Card, Col, Divider, Empty, Image, Row, Tag, Typography } from "antd";
import { FaCamera } from "react-icons/fa";

const { Text } = Typography;

const PetPhotosGallery = ({ photos }) => {
  return (
    <div style={{ marginTop: "24px" }}>
      <Divider orientation="left">
        <FaCamera style={{ marginRight: 8 }} />
        Galería de Fotos ({photos?.length})
      </Divider>

      {photos?.length === 0 ? (
        <Empty description="No hay fotos de esta mascota" />
      ) : (
        <div style={{ marginTop: "16px" }}>
          <Row gutter={[16, 16]}>
            {photos?.map((photo) => (
              <Col key={photo.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <Image
                      alt={`Foto de ${photo.id}`}
                      src={photo.url}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      preview={{
                        mask: (
                          <Text strong style={{ color: "white" }}>
                            {photo.is_primary ? "Foto Principal" : "Ampliar Foto"}
                          </Text>
                        ),
                        maskClassName: "custom-image-mask",
                      }}
                    />
                  }
                  styles={{
                    body: { padding: "12px", textAlign: "center" }, // Nueva forma
                  }}
                >
                  {photo.is_primary && (
                    <Tag color="green" style={{ margin: 0 }}>
                      Principal
                    </Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default PetPhotosGallery;
