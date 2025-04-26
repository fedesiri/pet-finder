import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, Typography, message } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PetLogo from "../../components/ui/PetLogo";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../credentials";

const { Title } = Typography;

export default function LoginPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const email = values.username;
    const password = values.password;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: "error",
        content: "Error al iniciar sesión: " + error.message,
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
          maxWidth: "420px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <PetLogo />
          <Title level={3} style={{ marginTop: "16px" }}>
            Iniciar Sesión
          </Title>
        </div>

        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: "Por favor ingresa tu usuario!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Por favor ingresa tu contraseña!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Recordarme</Checkbox>
              </Form.Item>

              <Button
                type="link"
                onClick={() => navigate("/forgot-password")}
                style={{
                  padding: "4px 0",
                  height: "auto",
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="default" htmlType="submit" block size="large" loading={loading}>
              Ingresar
            </Button>
          </Form.Item>

          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "14px",
            }}
          >
            ¿No tenés usuario?{" "}
            <Button
              type="link"
              onClick={() => navigate("/register-user")}
              style={{
                padding: "0",
                height: "auto",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ¡Registrate!
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
