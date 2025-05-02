import { Button, Form, Input, message, Modal, Select, Spin } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { FaQrcode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useRequestPetCode } from "../hooks/useRequestPetCode";
import { useUserProfile } from "../hooks/useUserProfile";

const RequestTagModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { requestCode, data, loading, error } = useRequestPetCode();
  const { user } = useContext(AuthContext);
  const { addresses, loading: profileLoading } = useUserProfile();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const token = user?.accessToken;
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onAddressSelect = (address_id) => {
    const address = addresses.find((addr) => addr.id === address_id);
    setSelectedAddress(address);

    if (address) {
      form.setFieldsValue({
        street: address.street,
        number: address.number,
        province_id: address.province_id,
        locality_id: address.locality_id,
      });
    } else {
      form.setFieldsValue({
        street: undefined,
        number: undefined,
        province_id: undefined,
        locality_id: undefined,
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const selectedAddress = addresses.find((addr) => addr.id === values.address_id);

      const payload = {
        address_id: values.address_id,
        street: selectedAddress?.street || values.street,
        number: selectedAddress?.number || values.number,
        province_id: selectedAddress?.province_id || values.province_id,
        locality_id: selectedAddress?.locality_id || values.locality_id,
      };

      await requestCode(payload, token);
    } catch (err) {
      console.error("Error:", err);
    }
  };
  const handleContinue = () => {
    onCancel();
    if (data?.code) {
      navigate(`/register-pet/${data.code}`);
    }
  };

  if (profileLoading) {
    return (
      <Modal open={visible} onCancel={onCancel} footer={null}>
        <Spin tip="Cargando direcciones..." />
      </Modal>
    );
  }

  return (
    <Modal
      title="Solicitar chapita identificadora"
      open={visible}
      onCancel={onCancel}
      footer={
        data ? (
          <Button type="primary" onClick={handleContinue}>
            Continuar al registro
          </Button>
        ) : null
      }
      width={800}
    >
      {!data ? (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="address_id"
            label="Seleccionar dirección existente"
            extra="Si no seleccionas una dirección, completa los datos de envío manualmente"
          >
            <Select
              placeholder="Selecciona una dirección"
              allowClear
              onChange={onAddressSelect}
              options={addresses?.map((addr) => ({
                value: addr.id,
                label: `${addr.street} ${addr.number}, ${addr.locality}`,
              }))}
            />
          </Form.Item>

          {!selectedAddress && (
            <>
              <Form.Item name="street" label="Calle" rules={[{ required: true, message: "Ingresa la calle" }]}>
                <Input />
              </Form.Item>

              <Form.Item name="number" label="Número" rules={[{ required: true, message: "Ingresa el número" }]}>
                <Input />
              </Form.Item>

              <Form.Item
                name="province_id"
                label="Provincia"
                rules={[{ required: true, message: "Selecciona una provincia" }]}
              >
                <Select
                  placeholder="Selecciona una provincia"
                  options={[
                    { value: "1", label: "Buenos Aires" },
                    { value: "2", label: "Córdoba" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="locality_id"
                label="Localidad"
                rules={[{ required: true, message: "Selecciona una localidad" }]}
              >
                <Select
                  placeholder="Selecciona una localidad"
                  options={[
                    { value: "101", label: "La Plata" },
                    { value: "102", label: "Mar del Plata" },
                  ]}
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<FaQrcode />}>
              Generar código QR
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3>¡Chapita generada con éxito!</h3>
          <p>
            Tu código es: <strong>{data.code}</strong>
          </p>
          <img src={data.qrImage} alt="QR Code" style={{ maxWidth: "300px", margin: "20px auto" }} />
          <p>Cuando recibas tu chapita, escanea el código QR para completar el registro de tu mascota.</p>
        </div>
      )}
    </Modal>
  );
};

export default RequestTagModal;
