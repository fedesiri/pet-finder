import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Col, Collapse, Input, Row, Select, Space, Tag } from "antd";
import { useEffect } from "react";
import { useProvincesAndLocalities } from "../hooks/useProvincesAndLocalities";

const { Option } = Select;

const LostPetsFilters = ({ filters, onFilterChange, userLocation }) => {
  const NON_FILTER_KEYS = ["is_active", "page", "items_per_page"];

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    return !NON_FILTER_KEYS.includes(key) && value !== null && value !== undefined && value !== "";
  }).length;

  const {
    provinces,
    localities,
    loading,
    selectedProvince,
    handleProvinceSearch,
    handleLocalitySearch,
    handleProvinceChange,
    loadMoreProvinces,
    loadMoreLocalities,
    loadLocalityInfo,
    selectedLocalityInfo,
  } = useProvincesAndLocalities();

  useEffect(() => {
    if (filters.province_id && filters.province_id !== selectedProvince) {
      handleProvinceChange(filters.province_id);
    }

    if (filters.locality_id && !localities.some((l) => l.id === filters.locality_id)) {
      loadLocalityInfo(filters.province_id, filters.locality_id);
    }
  }, [filters.province_id, filters.locality_id]);

  const collapseItems = [
    {
      key: "1",
      label: (
        <Space>
          <FilterOutlined />
          <span style={{ fontWeight: 500 }}>Filtros avanzados</span>
          {activeFiltersCount > 0 && <Tag color="blue">{activeFiltersCount} activos</Tag>}
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Provincia */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Provincia</label>
              <Select
                placeholder="Seleccionar provincia"
                style={{ width: "100%" }}
                value={filters.province_id || undefined}
                onChange={(value) => {
                  handleProvinceChange(value);
                  onFilterChange("province_id", value);
                  onFilterChange("locality_id", null);
                }}
                onSearch={handleProvinceSearch}
                showSearch
                filterOption={false}
                loading={loading.provinces || loading.moreProvinces}
                allowClear
                onPopupScroll={(e) => {
                  const { target } = e;
                  if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
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
            </div>
          </Col>

          {/* Localidad */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Localidad</label>
              <Select
                placeholder="Seleccionar localidad"
                style={{ width: "100%" }}
                value={
                  filters.locality_id
                    ? {
                        value: filters.locality_id,
                        label: (() => {
                          const foundInList = localities.find((l) => l.id === filters.locality_id);
                          if (foundInList) return foundInList.name;

                          if (selectedLocalityInfo?.id === filters.locality_id) {
                            return selectedLocalityInfo.name;
                          }

                          if (userLocation?.locality_id === filters.locality_id) {
                            return userLocation.locality;
                          }

                          return "Cargando...";
                        })(),
                      }
                    : undefined
                }
                onChange={(value) => {
                  onFilterChange("locality_id", value);
                  loadLocalityInfo(filters.province_id, value);
                }}
                onSearch={handleLocalitySearch}
                showSearch
                filterOption={false}
                disabled={!filters.province_id}
                loading={loading.localities}
                allowClear
                onPopupScroll={(e) => {
                  const { target } = e;
                  if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                    loadMoreLocalities();
                  }
                }}
                notFoundContent={loading.localities ? "Buscando..." : "No se encontraron localidades"}
              >
                {localities.map((locality) => (
                  <Option key={locality.id} value={locality.id}>
                    {locality.name}
                  </Option>
                ))}
                {/* Opción oculta para mantener la selección */}
                {filters.locality_id && !localities.some((l) => l.id === filters.locality_id) && (
                  <Option key={filters.locality_id} value={filters.locality_id} style={{ display: "none" }}>
                    {userLocation?.locality_id === filters.locality_id
                      ? userLocation.locality
                      : `Localidad (ID: ${filters.locality_id})`}
                  </Option>
                )}
              </Select>
            </div>
          </Col>

          {/* Nombre de mascota */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Nombre de mascota</label>
              <Input
                placeholder="Buscar por nombre"
                value={filters.name || ""}
                onChange={(e) => onFilterChange("name", e.target.value)}
                allowClear
              />
            </div>
          </Col>

          {/* Raza */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Raza</label>
              <Input
                placeholder="Ej: Labrador"
                value={filters.breed || ""}
                onChange={(e) => onFilterChange("breed", e.target.value)}
                allowClear
              />
            </div>
          </Col>
        </Row>
      ),
      extra: (
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            Object.keys(filters).forEach((key) => onFilterChange(key, null));
          }}
        />
      ),
    },
  ];

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={["1"]}
      style={{ marginBottom: 24, background: "transparent" }}
      expandIconPosition="end"
      items={collapseItems} // Usamos la nueva prop `items`
    />
  );
};

export default LostPetsFilters;
