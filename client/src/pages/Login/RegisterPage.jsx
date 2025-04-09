import { Button, Card, Col, DatePicker, Form, Input, message, Row, Select, Steps, Typography, Upload } from "antd";
import React, { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaEnvelope,
  FaHome,
  FaIdCard,
  FaImages,
  FaLock,
  FaPaw,
  FaPhone,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PetLogo from "../../components/ui/PetLogo";

const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [petPhotos, setPetPhotos] = useState([]);

  const steps = [
    {
      title: "Cuenta",
      icon: <FaUser />,
      content: "Datos de acceso",
      fields: ["email", "password", "confirmPassword"],
    },
    {
      title: "Dueño",
      icon: <FaIdCard />,
      content: "Información personal",
      fields: ["fullName", "phone", "address"],
    },
    {
      title: "Mascota",
      icon: <FaPaw />,
      content: "Datos de la mascota",
      fields: ["petName", "species", "color"],
    },
  ];

  const next = () => {
    form
      .validateFields(steps[current].fields)
      .then(() => setCurrent(current + 1))
      .catch((err) => console.log("Validation failed:", err));
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        user: {
          email: values.email,
          password: values.password,
          name: values.fullName,
          phone: values.phone,
          address: values.address,
        },
        pet: {
          name: values.petName,
          species: values.species,
          breed: values.breed,
          color: values.color,
          distinctive_marks: values.distinctiveMarks,
          birthdate: values.birthdate?.format("YYYY-MM-DD"),
          photos: petPhotos,
        },
      };

      console.log("Datos a enviar:", payload);
      // await api.post('/register', payload);

      message.success("Registro completado exitosamente!");
      navigate("/login");
    } catch (error) {
      message.error("Error en el registro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Opciones para selects
  const speciesOptions = ["Perro", "Gato", "Conejo", "Ave", "Otro"];
  const colorOptions = ["Blanco", "Negro", "Marrón", "Gris", "Atigrado", "Multicolor"];

  return (
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
          Registrá tus datos y los de tu mascota
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
              { required: true, message: "Por favor ingresa tu email" },
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
              { required: true, message: "Por favor ingresa una contraseña" },
              { min: 8, message: "Mínimo 8 caracteres" },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
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

        {/* Paso 2: Datos del Dueño */}
        <div style={{ display: current === 1 ? "block" : "none" }}>
          <Form.Item
            name="fullName"
            label={
              <span>
                <FaUser style={{ marginRight: 8 }} />
                Nombre Completo
              </span>
            }
            rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          <Form.Item
            name="phone"
            label={
              <span>
                <FaPhone style={{ marginRight: 8 }} />
                Teléfono
              </span>
            }
            rules={[
              { required: true, message: "Por favor ingresa tu teléfono" },
              { pattern: /^[0-9+]+$/, message: "Solo números y +" },
            ]}
          >
            <Input placeholder="+5491122334455" />
          </Form.Item>

          <Form.Item
            name="address"
            label={
              <span>
                <FaHome style={{ marginRight: 8 }} />
                Dirección
              </span>
            }
            rules={[{ required: true, message: "Por favor ingresa tu dirección" }]}
          >
            <Input.TextArea placeholder="Calle, número, departamento" rows={2} />
          </Form.Item>
        </div>

        {/* Paso 3: Datos de la Mascota */}
        <div style={{ display: current === 2 ? "block" : "none" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="petName"
                label={
                  <span>
                    <FaPaw style={{ marginRight: 8 }} />
                    Nombre de la mascota
                  </span>
                }
                rules={[{ required: true, message: "Ingresá el nombre" }]}
              >
                <Input placeholder="Ej: Firulais" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="species" label="Especie" rules={[{ required: true, message: "Seleccioná una especie" }]}>
                <Select placeholder="Seleccioná una especie">
                  {speciesOptions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="breed"
            label={
              <span>
                <FaPaw style={{ marginRight: 8 }} />
                Raza (opcional)
              </span>
            }
          >
            <Input placeholder="Ej: Labrador, Siames, etc." />
          </Form.Item>

          <Form.Item
            name="color"
            label="Colores"
            rules={[{ required: true, message: "Ingresá el color" }]}
            getValueFromEvent={(value) => value.join(", ")} // Convierte array a string
            getValueProps={(value) => ({ value: value ? value.split(", ") : [] })}
          >
            <Select mode="tags" style={{ width: "100%" }} placeholder="Seleccioná color/es" tokenSeparators={[","]}>
              {colorOptions.map((color) => (
                <Option key={color}>{color}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="distinctiveMarks"
            label={
              <span>
                <FaPaw style={{ marginRight: 8 }} />
                Marcas distintivas (opcional)
              </span>
            }
          >
            <Input.TextArea placeholder="Manchas, cicatrices, características especiales..." rows={2} />
          </Form.Item>

          <Form.Item
            name="birthdate"
            label={
              <span>
                <FaPaw style={{ marginRight: 8 }} />
                Fecha de nacimiento aproximada (opcional)
              </span>
            }
          >
            <DatePicker style={{ width: "100%" }} placeholder="Seleccioná fecha" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                <FaImages style={{ marginRight: 8 }} />
                Fotos de la mascota (máx. 5)
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={petPhotos}
              onChange={({ fileList }) => setPetPhotos(fileList)}
              beforeUpload={() => false}
              maxCount={5}
            >
              {petPhotos.length >= 5 ? null : (
                <div>
                  <FaUpload style={{ fontSize: "20px", marginBottom: "8px" }} />
                  <div>Subir foto</div>
                </div>
              )}
            </Upload>
          </Form.Item>
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
            {current < steps.length - 1 ? (
              <Button type="primary" onClick={next} icon={<FaArrowRight />} size="large">
                Siguiente
              </Button>
            ) : (
              <Button type="primary" htmlType="submit" loading={loading} icon={<FaCheck />} size="large">
                Completar Registro
              </Button>
            )}
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
