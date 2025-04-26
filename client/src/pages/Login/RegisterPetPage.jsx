import { Card, Col, DatePicker, Form, Input, message, Row, Select, Typography, Upload } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { FaImages, FaPaw, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PetLogo from "../../components/ui/PetLogo";

import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { storage } from "../../credentials";
import { useSpecies } from "../../hooks/useSpecies";

const { Title } = Typography;
const { Option } = Select;

export default function RegisterPetPage() {
  const [form] = Form.useForm();
  // LOADING VA A USARSE CUANDO CONFIRMEMOS EL FORM
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  const [petPhotos, setPetPhotos] = useState([]);

  //relacionado a species
  const { speciesOptions } = useSpecies();

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

      const pet = {
        name: values.petName,
        species: values.species,
        breed: values.breed,
        color: values.color,
        distinctive_marks: values.distinctiveMarks,
        birthdate: values.birthdate?.format("YYYY-MM-DD"),
        photos: photoUrls.filter((url) => url),
      };

      // await registerPet(pet);

      // messageApi.open({
      //   type: "success",
      //   content: "Registro completado exitosamente!",
      // });
      navigate("/home");
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error en el registro de la mascota: " + error.message,
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
            Registrá los datos de tu mascota
          </Title>
        </div>

        <Form
          form={form}
          name="register-pet"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          scrollToFirstError
        >
          {/* Paso 3: Datos de la Mascota FIJARSE COMO QUEDA ESE DISPLAY! */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
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
        </Form>
      </Card>
    </>
  );
}
