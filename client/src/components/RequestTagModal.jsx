import { Button, Form, message, Modal, Select, Spin } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { FaPlus, FaQrcode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProvincesAndLocalities } from "../hooks/useProvincesAndLocalities";
import { useRequestPetCode } from "../hooks/useRequestPetCode";
import { useUserProfile } from "../hooks/useUserProfile";
import AddressForm from "./AddressForm";

const RequestTagModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { requestCode, data, loading, error } = useRequestPetCode();
  const { user } = useContext(AuthContext);
  const { addresses, loading: profileLoading } = useUserProfile();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const {
    provinces,
    localities,
    selectedProvince,
    pagination,
    handleProvinceSearch,
    handleLocalitySearch,
    handleProvinceChange,
    loadMoreProvinces,
    loadMoreLocalities,
  } = useProvincesAndLocalities();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (error) {
      messageApi.open({
        type: "error",
        content: "Error al solicitar el código :",
        error,
      });
    }
  }, [error, messageApi]);

  const onAddressSelect = (address_id) => {
    const address = addresses.find((addr) => addr.id === address_id);
    setSelectedAddress(address);
    setShowAddressForm(false);

    if (address) {
      form.setFieldsValue({
        street: address.street,
        address_number: address.address_number,
        province_id: address.province_id,
        locality_id: address.locality_id,
        zip_code: address.zip_code,
        neighborhood: address.neighborhood,
      });
    } else {
      form.resetFields(["street", "address_number", "province_id", "locality_id", "zip_code", "neighborhood"]);
    }
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setSelectedAddress(null);
    form.resetFields([
      "address_id",
      "street",
      "address_number",
      "province_id",
      "locality_id",
      "zip_code",
      "neighborhood",
    ]);
  };

  const onFinish = async (values) => {
    try {
      const selectedAddress = addresses.find((addr) => addr.id === values.address_id);

      const payload = {
        address_id: values.address_id,
        street: selectedAddress?.street || values.street,
        number: selectedAddress?.address_number || values.address_number,
        province_id: selectedAddress?.province_id || values.province_id,
        locality_id: selectedAddress?.locality_id || values.locality_id,
        zip_code: selectedAddress?.zip_code || values.zip_code,
        neighborhood: selectedAddress?.neighborhood || values.neighborhood,
      };

      await requestCode(payload, token);

      if (!values.address_id) {
        messageApi.open({
          type: "success",
          content: "Nueva dirección creada con éxito",
        });
      }
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
    <>
      {contextHolder}
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
              extra={selectedAddress ? "" : "Si no es ninguna de éstas, agregá una nueva dirección"}
            >
              <Select
                placeholder="Selecciona una dirección"
                allowClear
                onChange={onAddressSelect}
                options={addresses?.map((addr) => ({
                  value: addr.id,
                  label: `${addr.street} ${addr.number}, ${addr.locality}, ${addr.province}`,
                }))}
              />
            </Form.Item>

            {!selectedAddress && !showAddressForm && (
              <div style={{ marginBottom: 16 }}>
                <Button type="dashed" onClick={handleAddNewAddress} icon={<FaPlus />} block>
                  Agregar nueva dirección
                </Button>
              </div>
            )}

            {(showAddressForm || (!selectedAddress && !addresses?.length)) && (
              <AddressForm
                form={form}
                provinces={provinces}
                localities={localities}
                selectedProvince={selectedProvince}
                loading={profileLoading}
                pagination={pagination}
                handleProvinceSearch={handleProvinceSearch}
                handleLocalitySearch={handleLocalitySearch}
                handleProvinceChange={handleProvinceChange}
                loadMoreProvinces={loadMoreProvinces}
                loadMoreLocalities={loadMoreLocalities}
                showAddressCheckbox={false}
              />
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
    </>
  );
};

export default RequestTagModal;
