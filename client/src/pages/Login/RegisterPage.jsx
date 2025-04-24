import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Steps,
  Typography,
  Upload
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCity,
  FaEnvelope,
  FaHome,
  FaIdCard,
  FaImages,
  FaLock,
  FaMapMarkerAlt,
  FaPaw,
  FaPhone,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PetLogo from "../../components/ui/PetLogo";
import { registerPetWithUser } from "../../services/api";

import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, storage } from "../../credentials";
import { useProvincesAndLocalities } from "../../hooks/useProvincesAndLocalities";
import { useSpecies } from "../../hooks/useSpecies";

const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function RegisterPage() {
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

  const [petPhotos, setPetPhotos] = useState([]);

  //relacionado a species
  const { speciesOptions } = useSpecies();
  
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
      fields: ["fullName", "phone", "address", "addressNumber", "provinceId", "localityId"],
    },
    {
      title: "Mascota",
      icon: <FaPaw />,
      content: "Datos de la mascota",
      fields: [],
      requiredFields: ["petName", "species", "color"],
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
    form
      .validateFields(steps[2].requiredFields)
      .then(() => form.submit())
      .catch(() => {
        message.error("Completá los campos obligatorios");
      });
  };

  const handleImageUpload = async (file) => {
    try {
      // Crea una referencia única para cada imagen
      const safeFileName = file.name.replace(/[^\w.-]/g, "_");
      const storageRef = ref(storage, `pets/${dayjs()}_${safeFileName}`);
      // Sube el archivo con el tipo MIME correcto
      const metadata = {
        contentType: file.type,
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error detallado:", error);
      messageApi.open({
        type: "error",
        content: "Error al subir imagen: " + error.message,
      });
      throw error;
    }
  };

  const handleBeforeUpload = (file) => {
    // Validaciones básicas
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      messageApi.open({
        type: "error",
        content: "Sólo podés subir imagenes",
      });
      return Upload.LIST_IGNORE;
    }

    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      messageApi.open({
        type: "error",
        content: "La imagen debe ser menor a 5MB!",
      });
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleUploadChange = async ({ fileList }) => {
    // Filtra solo los archivos que no están en estado de error
    setPetPhotos(fileList);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const photoUrls = await Promise.all(
        petPhotos.map((file) => {
          if (file.originFileObj) {
            return handleImageUpload(file.originFileObj);
          }
          return file.url; // Si ya tiene URL (previamente subida)
        })
      );

      const firebaseUser = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const payload = {
        users: [
          {
            email: values.email,
            password: values.password,
            name: values.fullName,
            phone: `${values.phonePrefix}${values.phone}`,
            external_id: firebaseUser.user.uid,
            addresses: [
              {
                street: values.address,
                number: values.addressNumber,
                apartment: values.apartment,
                neighborhood: values.neighborhood,
                zip_code: values.zipCode,
                is_primary: true,
                show_address: values.showAddress,
                province_id: values.provinceId,
                locality_id: values.localityId,
              },
            ],
          },
        ],
        pet: {
          name: values.petName,
          species: values.species,
          breed: values.breed,
          color: values.color,
          distinctive_marks: values.distinctiveMarks,
          birthdate: values.birthdate?.format("YYYY-MM-DD"),
          photos: photoUrls.filter((url) => url),
        },
        qr_code: `PET-${dayjs()}`,
      };

      await registerPetWithUser(payload);

      messageApi.open({
        type: "success",
        content: "Registro completado exitosamente!",
      });
      navigate("/login");
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error en el registro: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = ["Blanco", "Negro", "Marrón", "Gris", "Atigrado", "Multicolor"];

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
                        pattern: /^[0-9]{8,12}$/,
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

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="provinceId"
                  label={
                    <span>
                      <FaMapMarkerAlt style={{ marginRight: 8 }} />
                      Provincia
                    </span>
                  }
                  rules={[{ required: true, message: "Seleccioná una provincia" }]}
                >
                  <Select
                    showSearch
                    placeholder="Seleccionar provincia"
                    onChange={handleProvinceChange}
                    onSearch={handleProvinceSearch}
                    filterOption={false}
                    loading={loading.provinces}
                    onPopupScroll={(e) => {
                      const target = e.currentTarget;
                      const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
                      const hasMore =
                        pagination.provinces.page * pagination.provinces.pageSize < pagination.provinces.total;

                      if (isBottom && hasMore && !loading.moreProvinces) {
                        loadMoreProvinces();
                      }
                    }}
                  >
                    {provinces.map((province) => (
                      <Option key={province.id} value={province.id}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="localityId"
                  label={
                    <span>
                      <FaCity style={{ marginRight: 8 }} />
                      Localidad
                    </span>
                  }
                  rules={[{ required: true, message: "Seleccioná una localidad" }]}
                >
                  <Select
                    showSearch
                    placeholder={selectedProvince ? "Seleccionar localidad" : "Seleccione provincia primero"}
                    optionFilterProp="children"
                    disabled={!selectedProvince}
                    onSearch={handleLocalitySearch}
                    filterOption={false}
                    loading={loading.localities}
                    onPopupScroll={(e) => {
                      const target = e.currentTarget;
                      const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;
                      const hasMore =
                        pagination.localities.page * pagination.localities.pageSize < pagination.localities.total;

                      if (isBottom && hasMore && !loading.moreLocalities) {
                        loadMoreLocalities();
                      }
                    }}
                  >
                    {localities.map((locality) => (
                      <Option key={locality.id} value={locality.id}>
                        {locality.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label={
                <span>
                  <FaHome style={{ marginRight: 8 }} />
                  Dirección completa
                </span>
              }
              rules={[{ required: true, message: "Por favor ingresá tu dirección" }]}
            >
              <TextArea placeholder="Calle, número, departamento" rows={2} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="addressNumber"
                  label="Número"
                  rules={[
                    { required: true, message: "Ingresá el número" },
                    {
                      pattern: /^[0-9]+$/,
                      message: "Solo se permiten números",
                    },
                  ]}
                >
                  <Input
                    placeholder="1234"
                    onKeyDown={(e) => {
                      // Permite: números, teclas de control (backspace, delete, tab)
                      if (
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      // Limpieza adicional por si pegan texto
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="apartment" label="Depto/Piso">
                  <Input placeholder="B" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="zipCode" label="Código Postal">
                  <Input placeholder="C1430" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="neighborhood" label="Barrio">
              <Input placeholder="Cancha de la liga" />
            </Form.Item>

            <Form.Item name="showAddress" valuePropName="checked" initialValue={false}>
              <Checkbox>Mostrar dirección en el perfil público de la mascota</Checkbox>
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
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Input placeholder="Ej: Firulais" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="species"
                  label="Especie"
                  rules={[{ required: true, message: "Seleccioná una especie" }]}
                  validateTrigger={["onChange", "onBlur"]}
                >
                  <Select placeholder="Selecciona" options={speciesOptions}></Select>
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
              validateTrigger={["onChange", "onBlur"]}
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
                onChange={handleUploadChange}
                beforeUpload={(file) => {
                  const isValid = handleBeforeUpload(file);
                  return isValid === true ? false : isValid; // false = no subir automáticamente
                }}
                maxCount={5}
                multiple
                accept="image/*"
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
