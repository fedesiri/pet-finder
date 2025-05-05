import { Button, Card, Col, Form, Input, message, Row, Steps, Typography } from "antd";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaEnvelope, FaIdCard, FaLock, FaPhone, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddressForm from "../../components/AddressForm";
import PetLogo from "../../components/ui/PetLogo";
import { auth } from "../../credentials";
import { useProvincesAndLocalities } from "../../hooks/useProvincesAndLocalities";
import { registerUser } from "../../services/api";

const { Step } = Steps;
const { Title } = Typography;

export default function RegisterUserPage() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  //relacionado a provincias y localidades
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

  const navigate = useNavigate();

  const steps = [
    {
      title: "Cuenta",
      icon: <FaUser />,
      content: "Datos de acceso",
      fields: ["email", "password", "confirm_password"],
    },
    {
      title: "Usuario",
      icon: <FaIdCard />,
      content: "Información personal",
      fields: ["full_name", "phone", "street", "address_number", "province_id", "locality_id"],
    },
  ];

  const next = () => {
    const currentStep = steps[current];

    if (current < steps.length - 1) {
      form
        .validateFields(currentStep.fields)
        .then(() => setCurrent(current + 1))
        .catch(() => {});
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleFinalSubmit = () => {
    form.submit();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Crear usuario en Firebase para obtener el external_id
      const firebaseUser = await createUserWithEmailAndPassword(auth, values.email, values.password);

      await updateProfile(firebaseUser.user, {
        displayName: values.full_name,
      });

      const payload = {
        users: [
          {
            email: values.email,
            password: values.password,
            name: values.full_name,
            phone: `${values.phonePrefix}${values.phone}`,
            external_id: firebaseUser.user.uid,
            addresses: [
              {
                street: values.street,
                number: values.address_number,
                apartment: values.apartment,
                neighborhood: values.neighborhood,
                zip_code: values.zip_code,
                is_primary: true,
                show_address: values.showAddress,
                province_id: values.province_id,
                locality_id: values.locality_id,
              },
            ],
          },
        ],
      };

      await registerUser(payload);

      messageApi
        .open({
          type: "success",
          content: "Registro completado exitosamente!",
          duration: 1.5,
        })
        .then(() => {
          navigate("/profile");
        });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error en el registro: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card
        style={{
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <PetLogo size={80} />
          <Title level={3} style={{ marginTop: "16px" }}>
            Registro de usuario
          </Title>
        </div>

        <Steps current={current} style={{ marginBottom: "32px" }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Form form={form} name="register" onFinish={onFinish} layout="vertical" autoComplete="off" scrollToFirstError>
          {/* Paso 1: Datos de Cuenta */}
          <div style={{ display: current === 0 ? "block" : "none" }}>
            <Form.Item
              name="email"
              label={
                <span>
                  <FaEnvelope style={{ marginRight: 8 }} />
                  Email
                </span>
              }
              rules={[
                { required: true, message: "Por favor ingresá tu email" },
                { type: "email", message: "Email no válido" },
              ]}
            >
              <Input placeholder="tucorreo@ejemplo.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span>
                  <FaLock style={{ marginRight: 8 }} />
                  Contraseña
                </span>
              }
              rules={[
                { required: true, message: "Por favor ingresá una contraseña" },
                { min: 8, message: "Mínimo 8 caracteres" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label={
                <span>
                  <FaLock style={{ marginRight: 8 }} />
                  Confirmar Contraseña
                </span>
              }
              dependencies={["password"]}
              rules={[
                { required: true, message: "Por favor confirma tu contraseña" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Las contraseñas no coinciden"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          </div>

          {/* Paso 2: Datos del Usuario */}
          <div style={{ display: current === 1 ? "block" : "none" }}>
            <Form.Item
              name="full_name"
              label={
                <span>
                  <FaUser style={{ marginRight: 8 }} />
                  Nombre Completo
                </span>
              }
              rules={[{ required: true, message: "Por favor ingresá tu nombre" }]}
            >
              <Input placeholder="Ej: Juan Pérez" />
            </Form.Item>

            <Form.Item
              label={
                <span>
                  <FaPhone style={{ marginRight: 8 }} />
                  Teléfono
                </span>
              }
              required
            >
              <Row gutter={8}>
                <Col span={4}>
                  <Form.Item name="phonePrefix" initialValue="+54" noStyle>
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={20}>
                  <Form.Item
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Ingresá código de área + número",
                      },
                      {
                        pattern: /^\d{8,12}$/,
                        message: "Debe ser un número válido. Ejemplo: 1122334455",
                      },
                    ]}
                    normalize={(value) => value.replace(/\D/g, "")}
                  >
                    <Input placeholder="1122334455" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>

            <AddressForm
              form={form}
              provinces={provinces}
              localities={localities}
              selectedProvince={selectedProvince}
              loading={loading}
              pagination={pagination}
              handleProvinceSearch={handleProvinceSearch}
              handleLocalitySearch={handleLocalitySearch}
              handleProvinceChange={handleProvinceChange}
              loadMoreProvinces={loadMoreProvinces}
              loadMoreLocalities={loadMoreLocalities}
            />
          </div>

          <Form.Item
            style={{
              marginTop: "24px",
              position: "relative",
              width: "100%",
              minHeight: "40px",
            }}
          >
            {current > 0 && (
              <Button
                onClick={prev}
                icon={<FaArrowLeft />}
                size="large"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                Anterior
              </Button>
            )}

            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
              }}
            >
              {current === steps.length - 1 ? (
                <Button type="primary" onClick={handleFinalSubmit} icon={<FaCheck />} loading={loading} size="large">
                  Completar Registro
                </Button>
              ) : (
                <Button type="primary" onClick={next} icon={<FaArrowRight />} size="large">
                  Siguiente
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
