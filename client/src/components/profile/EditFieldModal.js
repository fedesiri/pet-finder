import { Form, Input, message, Modal } from "antd";
import { useEffect } from "react";

const EditFieldModal = ({ visible, field, currentValue, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ [field]: currentValue });
    }
  }, [visible, currentValue, field, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values[field]);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Por favor complete correctamente el campo",
      });
    }
  };

  const fieldConfig = {
    name: {
      label: "Nombre completo",
      rules: [{ required: true, message: "Ingrese su nombre" }],
    },
    email: {
      label: "Email",
      rules: [
        { required: true, message: "Ingrese su email" },
        { type: "email", message: "Email inválido" },
      ],
    },
    phone: {
      label: "Teléfono",
      rules: [{ pattern: /^[0-9+]+$/, message: "Teléfono inválido" }],
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
        <Form form={form} layout="vertical" initialValues={{ [field]: currentValue }}>
          <Form.Item name={field} label={fieldConfig[field]?.label} rules={fieldConfig[field]?.rules}>
            {field === "email" ? <Input type="email" /> : <Input />}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditFieldModal;
