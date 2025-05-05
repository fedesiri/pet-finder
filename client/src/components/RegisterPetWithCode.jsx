import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { Button, Card, Form, message, Spin, Typography } from "antd";
import * as dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { FaQrcode } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { storage } from "../credentials";
import { useCheckCodeStatus } from "../hooks/useCheckCodeStatus";
import { useRegisterPetWithCode } from "../hooks/useRegisterPetWithCode";
import { useSpecies } from "../hooks/useSpecies";
import { useUserProfile } from "../hooks/useUserProfile";
import PetForm from "./PetForm";
import PetLogo from "./ui/PetLogo";

const { Title } = Typography;

const RegisterPetWithCode = () => {
  const { user } = useContext(AuthContext);
  const token = user?.accessToken;
  const { userData } = useUserProfile();
  const { code } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [petPhotos, setPetPhotos] = useState([]);
  const { speciesOptions } = useSpecies();
  const { checkStatus, status, loading: checking, error: checkError } = useCheckCodeStatus();
  const { registerPet, loading: registering, error: registerError } = useRegisterPetWithCode();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const colorOptions = ["Blanco", "Negro", "Marrón", "Gris", "Atigrado", "Multicolor"];

  useEffect(() => {
    if (code && !initialCheckDone) {
      const verifyCode = async () => {
        try {
          await checkStatus(code);
          setInitialCheckDone(true);
        } catch (error) {
          messageApi.open({
            type: "error",
            content: "Error al verificar codigo :",
            error,
          });
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
      messageApi.open({
        type: "error",
        content: "Error al checkear codigo :",
        checkError,
      });
    }
  }, [checkError, messageApi]);

  useEffect(() => {
    if (registerError) {
      messageApi.open({
        type: "error",
        content: "Error registrarse :",
        registerError,
      });
    }
  }, [registerError, messageApi]);

  const handleImageUpload = async (file) => {
    try {
      const safeFileName = file.name.replace(/[^\w.-]/g, "_");
      const storageRef = ref(storage, `pets/${dayjs()}_${safeFileName}`);
      const metadata = { contentType: file.type };
      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      const photoUrls = await Promise.all(
        petPhotos
          .filter((file) => file.originFileObj) // Solo archivos nuevos
          .map((file) => handleImageUpload(file.originFileObj))
      );

      // También incluir URLs de imágenes que ya estaban subidas (si las hay)
      const existingUrls = petPhotos.filter((file) => file.url && !file.originFileObj).map((file) => file.url);

      const allPhotoUrls = [...photoUrls, ...existingUrls];

      const petData = {
        ...values,
        photo_urls: allPhotoUrls,
        code,
        user_id: userData?.id,
      };

      await registerPet(petData, token);
      messageApi
        .open({
          type: "success",
          content: "Mascota registrada correctamente!",
          duration: 1.5,
        })
        .then(() => {
          navigate("/profile");
        });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Error al registrar la mascota :",
        error,
      });
    }
  };

  if (checking && !initialCheckDone) {
    return <Spin tip="Verificando código..." />;
  }

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
            {code ? "Registrar mascota con chapita" : "Registrar nueva mascota"}
          </Title>
          {code && (
            <p style={{ marginTop: "8px" }}>
              Estás registrando una mascota con el código: <strong>{code}</strong>
            </p>
          )}
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <PetForm
            form={form}
            petPhotos={petPhotos}
            setPetPhotos={setPetPhotos}
            speciesOptions={speciesOptions}
            colorOptions={colorOptions}
          />

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={registering} icon={<FaQrcode />}>
              {code ? "Registrar mascota" : "Crear mascota"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default RegisterPetWithCode;
