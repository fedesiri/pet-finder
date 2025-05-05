import { DatePicker, Form, Input, message, Select, Upload } from "antd";
import React from "react";
import { FaPaw, FaUpload } from "react-icons/fa";

const { Item } = Form;
const { Option } = Select;

export default function PetForm({ form, petPhotos, setPetPhotos, speciesOptions, colorOptions }) {
  const [messageApi, contextHolder] = message.useMessage();

  const beforeUpload = (file) => {
    // 1. Validar tipo de imagen
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      messageApi.open({
        type: "error",
        content: "¡Solo se permiten archivos de imagen!",
      });
      return Upload.LIST_IGNORE;
    }

    // 2. Validar tamaño (5MB)
    const isLt5MB = file.size / 1024 / 1024 < 5;
    if (!isLt5MB) {
      messageApi.open({
        type: "error",
        content: "¡La imagen debe pesar menos de 5MB!",
      });
      return Upload.LIST_IGNORE;
    }

    // 3. Permitir archivo (pero no subir automáticamente)
    return false;
  };

  // MANEJADOR DE CAMBIOS ORIGINAL
  const handleUploadChange = ({ fileList }) => {
    setPetPhotos(fileList);
  };
  return (
    <>
      {contextHolder}
      <Item
        name="name"
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
      </Item>

      <Item
        name="species"
        label="Especie"
        rules={[{ required: true, message: "Seleccioná una especie" }]}
        validateTrigger={["onChange", "onBlur"]}
      >
        <Select placeholder="Selecciona" options={speciesOptions} />
      </Item>

      <Item
        name="breed"
        label={
          <span>
            <FaPaw style={{ marginRight: 8 }} />
            Raza (opcional)
          </span>
        }
      >
        <Input placeholder="Ej: Labrador, Siames, etc." />
      </Item>

      <Item
        name="color"
        label="Colores"
        rules={[{ required: true, message: "Ingresá el color" }]}
        getValueFromEvent={(value) => value.join(", ")}
        getValueProps={(value) => ({ value: value ? value.split(", ") : [] })}
        validateTrigger={["onChange", "onBlur"]}
      >
        <Select mode="tags" style={{ width: "100%" }} placeholder="Seleccioná color/es" tokenSeparators={[","]}>
          {colorOptions?.map((color) => (
            <Option key={color}>{color}</Option>
          ))}
        </Select>
      </Item>

      <Item
        name="distinctive_marks"
        label={
          <span>
            <FaPaw style={{ marginRight: 8 }} />
            Marcas distintivas (opcional)
          </span>
        }
      >
        <Input.TextArea placeholder="Manchas, cicatrices, características especiales..." rows={2} />
      </Item>

      <Item
        name="birthdate"
        label={
          <span>
            <FaPaw style={{ marginRight: 8 }} />
            Fecha de nacimiento aproximada (opcional)
          </span>
        }
      >
        <DatePicker style={{ width: "100%" }} placeholder="Seleccioná fecha" />
      </Item>

      <Form.Item label="Fotos de la mascota (máx. 5)">
        <Upload
          listType="picture-card"
          fileList={petPhotos}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
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
    </>
  );
}
