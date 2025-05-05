import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { FaCity, FaHome, FaMapMarkerAlt } from "react-icons/fa";

const { Item } = Form;
const { TextArea } = Input;
const { Option } = Select;

export default function AddressForm({
  form,
  provinces = [],
  localities = [],
  selectedProvince,
  loading = {},
  pagination = {},
  handleProvinceSearch,
  handleLocalitySearch,
  handleProvinceChange,
  loadMoreProvinces,
  loadMoreLocalities,
  showAddressCheckbox = true,
}) {
  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Item
            name="province_id"
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
                const hasMore = pagination.provinces.page * pagination.provinces.pageSize < pagination.provinces.total;

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
          </Item>
        </Col>
        <Col span={12}>
          <Item
            name="locality_id"
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
          </Item>
        </Col>
      </Row>

      <Item
        name="street"
        label={
          <span>
            <FaHome style={{ marginRight: 8 }} />
            Dirección completa
          </span>
        }
        rules={[{ required: true, message: "Por favor ingresá tu dirección" }]}
      >
        <TextArea placeholder="Calle, número, departamento" rows={2} />
      </Item>

      <Row gutter={16}>
        <Col span={8}>
          <Item
            name="address_number"
            label="Número"
            rules={[
              { required: true, message: "Ingresá el número" },
              {
                pattern: /^\d+$/,
                message: "Solo se permiten números",
              },
            ]}
          >
            <Input
              placeholder="1234"
              onKeyDown={(e) => {
                if (!/\d/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
            />
          </Item>
        </Col>
        <Col span={8}>
          <Item name="apartment" label="Depto/Piso">
            <Input placeholder="B" />
          </Item>
        </Col>
        <Col span={8}>
          <Item name="zip_code" label="Código Postal">
            <Input placeholder="C1430" />
          </Item>
        </Col>
      </Row>

      <Item name="neighborhood" label="Barrio">
        <Input placeholder="Cancha de la liga" />
      </Item>

      {showAddressCheckbox && (
        <Item name="showAddress" valuePropName="checked" initialValue={false}>
          <Checkbox>Mostrar dirección en el perfil público</Checkbox>
        </Item>
      )}
    </>
  );
}
