import { DatePicker, Form, Input, message, Modal, Select } from "antd";
import * as dayjs from "dayjs";
import { useEffect } from "react";
import { FaCat, FaDog, FaPaw } from "react-icons/fa";

const { Option } = Select;

export const EditPetFieldModal = ({ visible, field, currentValue, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!visible) return;

    if (field === "birthdate") {
      const parsed = currentValue ? dayjs(currentValue) : null;
      form.setFieldsValue({
        [field]: parsed?.isValid() ? parsed : null,
      });
    } else {
      form.setFieldsValue({ [field]: currentValue });
    }
  }, [visible, field, currentValue, form]);

  const getFieldInput = () => {
    switch (field) {
      case "species":
        return (
          <Select placeholder="Selecciona especie">
            <Option value="DOG">
              <FaDog /> Perro
            </Option>
            <Option value="CAT">
              <FaCat /> Gato
            </Option>
            <Option value="OTHER">
              <FaPaw /> Otra
            </Option>
          </Select>
        );
      case "birthdate":
        return (
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            disabledDate={(current) => current && current > dayjs().endOf("day")}
          />
        );
      case "distinctive_marks":
        return <Input.TextArea rows={3} />;
      default:
        return <Input />;
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let value = values[field];

      if (field === "birthdate") {
        const parsed = dayjs(value);
        if (!parsed.isValid()) {
          throw new Error("Fecha inválida");
        }
        value = parsed;
      }

      await onSave(value);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Por favor completá correctamente el campo",
      });
    }
  };

  const fieldConfig = {
    species: {
      label: "Especie",
      rules: [{ required: true, message: "Seleccioná una especie" }],
    },
    birthdate: {
      label: "Fecha de nacimiento",
      rules: [{ required: true, message: "Seleccioná una fecha" }],
    },
    distinctive_marks: {
      label: "Marcas distintivas",
      rules: [{ required: true, message: "Completá las marcas distintivas" }],
    },
    name: {
      label: "Nombre",
      rules: [{ required: true, message: "Ingresá el nombre" }],
    },
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Editar ${fieldConfig[field]?.label || field}`}
        open={visible}
        onOk={handleOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okText="Editar"
        afterClose={() => form.resetFields()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name={field} label={fieldConfig[field]?.label} rules={fieldConfig[field]?.rules}>
            {getFieldInput()}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
