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
import { getLocalities, getProvinces, getSpecies } from "../../services/api";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../credentials";


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
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [searchProvince, setSearchProvince] = useState("");
  const [searchLocality, setSearchLocality] = useState("");

  const navigate = useNavigate();

  const [petPhotos, setPetPhotos] = useState([]);

  //relacionado a species
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [loadingSpecies, setLoadingSpecies] = useState(true);
  const [errorSpecies, setErrorSpecies] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loadProvinces = async () => {
        setLoadingProvinces(true);
        try {
          const data = await getProvinces(searchProvince);
          setProvinces(data);
        } catch (error) {
          messageApi.open({
                  type: "error",
                  content: "Error buscando provincias :" + error.message,
                });
      
        } finally {
          setLoadingProvinces(false);
        }
      };
      loadProvinces();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchProvince]);

  useEffect(() => {
    const loadLocalities = async () => {
      if (!selectedProvince) return;

      setLoadingLocalities(true);
      try {
        const data = await getLocalities(selectedProvince, searchLocality);
        setLocalities(data);
      } catch (error) {
        messageApi.open({
          type: "error",
          content: "Error cargando localidades: " + error.message,
        });
      } finally {
        setLoadingLocalities(false);
      }
    };

    const timer = setTimeout(() => {
      loadLocalities();
    }, 500); // Debounce para búsqueda

    return () => clearTimeout(timer);
  }, [selectedProvince, searchLocality]);

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

  const handleProvinceSearch = async (value) => {
    setSearchProvince(value);
    try {
      const data = await getProvinces(value);
      setProvinces(data);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error buscando provincias: " + error.message,
      });
    }
  };

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

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        users: [
          {
            email: values.email,
            password: values.password,
            name: values.fullName,
            phone: values.phone,
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
          photos: petPhotos,
        },
        qr_code: `PET-${dayjs()}`,
      };

      console.log("Datos a enviar:", payload);
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      // await api.post('/register', payload);

      message.success("Registro completado exitosamente!");
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
                  placeholder="Seleccioná provincia"
                  onChange={(value) => {
                    setSelectedProvince(value);
                    form.setFieldsValue({ localityId: undefined });
                  }}
                  showSearch
                  optionFilterProp="children"
                  loading={loadingProvinces}
                  filterOption={false}
                  onSearch={handleProvinceSearch}
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
                  placeholder={selectedProvince ? "Seleccioná localidad" : "Primero selecciona provincia"}
                  disabled={!selectedProvince}
                  showSearch
                  optionFilterProp="children"
                  loading={loadingLocalities}
                  onSearch={setSearchLocality}
                  filterOption={false}
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
              <Form.Item name="addressNumber" label="Número" rules={[{ required: true, message: "Ingresá el número" }]}>
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
              <Form.Item name="species" label="Especie" rules={[{ required: true, message: "Seleccioná una especie" }]}>
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
    </>);
}
