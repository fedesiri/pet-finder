import { Button, Card, Form, Input, message, Spin } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { FaPaw, FaQrcode } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCheckCodeStatus } from "../hooks/useCheckCodeStatus";
import { useRegisterPetWithCode } from "../hooks/useRegisterPetWithCode";

const RegisterPetWithCode = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;
  const { code } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { checkStatus, status, loading: checking, error: checkError } = useCheckCodeStatus();
  const { registerPet, loading: registering, error: registerError } = useRegisterPetWithCode();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (code && !initialCheckDone) {
      const verifyCode = async () => {
        try {
          await checkStatus(code);
          setInitialCheckDone(true);
        } catch (error) {
          message.error(error.message);
          navigate("/");
        }
      };
      verifyCode();
    } else if (!code) {
      setInitialCheckDone(true);
    }
  }, [code, initialCheckDone, checkStatus, navigate]);

  useEffect(() => {
    if (status?.is_activated && status?.pet) {
      navigate(`/pet/${status.pet.id}`);
    }
  }, [status, navigate]);

  useEffect(() => {
    if (checkError) {
      message.error(checkError);
    }
  }, [checkError]);

  useEffect(() => {
    if (registerError) {
      message.error(registerError);
    }
  }, [registerError]);

  const onFinish = async (values) => {
    try {
      await registerPet(
        {
          ...values,
          code,
        },
        token
      );
      message.success("Mascota registrada correctamente!");
      navigate("/profile");
    } catch (error) {
      message.error("Error al registrar la mascota");
    }
  };

  if (checking && !initialCheckDone) {
    return <Spin tip="Verificando código..." />;
  }

  return (
    <Card
      title={
        <span>
          <FaPaw /> {code ? "Registrar mascota con chapita" : "Registrar nueva mascota"}
        </span>
      }
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Nombre de la mascota"
          rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>

        {/* Más campos del formulario... */}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={registering} icon={<FaQrcode />}>
            {code ? "Registrar mascota" : "Crear mascota"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterPetWithCode;
