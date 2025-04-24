import {
  Alert,
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
  Spin,
  Steps,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
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
import { getSpecies, registerPetWithUser } from "../../services/api";

import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, storage } from "../../credentials";
import { useProvincesAndLocalities } from "../../hooks/useProvincesAndLocalities";

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
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const [errorSpecies, setErrorSpecies] = useState(null);

  useEffect(() => {
    const loadSpecies = async () => {
      try {
        const response = await getSpecies();
        const options = response.values.map((value) => ({
          value,
          label: response.labels[value],
        }));
        setSpeciesOptions(options);
      } catch (err) {
        setErrorSpecies(err instanceof Error ? err : new Error("Error cargando especies"));
      } finally {
        setLoadingSpecies(false);
      }
    };

    loadSpecies();
  }, []);

  if (loadingSpecies) return <Spin tip="Cargando especies..." />;
  if (errorSpecies) return <Alert message={errorSpecies.message} type="error" />;

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
      fields: ["fullName", "phone", "address", "provinceId", "localityId"],
    },
    {
      title: "Mascota",
      icon: <FaPaw />,
      content: "Datos de la mascota",
      fields: ["petName", "species", "breed", "color"],
    },
  ];

  const next = () => {
    form
      .validateFields(steps[current].fields)
      .then(() => setCurrent(current + 1))
      .catch((err) => console.error("Validation failed:", err));
  };

  const prev = () => {
    setCurrent(current - 1);
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
      messageApi.error(`Error al subir imagen: ${error.message}`);
      throw error;
    }
  };

  const handleBeforeUpload = (file) => {
    // Validaciones básicas
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      messageApi.error("Solo puedes subir imágenes!");
      return Upload.LIST_IGNORE;
    }

    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      messageApi.error("La imagen debe ser menor a 5MB!");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleUploadChange = async ({ fileList }) => {
    // Filtra solo los archivos que no están en estado de error
    // const validFiles = fileList.filter(file => !file.error);
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
            phone: values.phone,
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
              name="phone"
              label={
                <span>
                  <FaPhone style={{ marginRight: 8 }} />
                  Teléfono
                </span>
              }
              rules={[
                { required: true, message: "Por favor ingresá tu teléfono" },
                { pattern: /^[0-9+]+$/, message: "Solo números y +" },
              ]}
            >
              <Input placeholder="+5491122334455" />
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
                  rules={[{ required: true, message: "Ingresá el número" }]}
                >
                  <Input placeholder="1234" />
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
              <Input placeholder="Palermo" />
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
                >
                  <Input placeholder="Ej: Firulais" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="species"
                  label="Especie"
                  rules={[{ required: true, message: "Seleccioná una especie" }]}
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
    </>
  );
}
