import React, { useState, useMemo } from "react";
import { Form, Badge, Button, ListGroup, InputGroup } from "react-bootstrap";
import "./MultiSelectWithSearch.css";

/**
 * Component chọn nhiều item với tính năng tìm kiếm
 * @param {Object} props
 * @param {Array} props.options - Danh sách options [{value, label}]
 * @param {Array} props.selectedValues - Mảng các giá trị đã chọn
 * @param {Function} props.onChange - Callback khi thay đổi selection
 * @param {String} props.label - Label hiển thị
 * @param {String} props.placeholder - Placeholder cho ô tìm kiếm
 * @param {Number} props.maxHeight - Chiều cao tối đa của danh sách
 */
const MultiSelectWithSearch = ({
  options = [],
  selectedValues = [],
  onChange,
  label = "Chọn items",
  placeholder = "Tìm kiếm...",
  maxHeight = 300,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Lọc options theo search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  // Lấy thông tin các item đã chọn
  const selectedItems = useMemo(() => {
    return selectedValues
      .map((val) => options.find((opt) => opt.value === val))
      .filter(Boolean);
  }, [selectedValues, options]);

  // Thêm item vào selection
  const handleAddItem = (value, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
  };

  // Xóa item khỏi selection
  const handleRemoveItem = (value, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange(selectedValues.filter((v) => v !== value));
  };

  // Xóa tất cả
  const handleClearAll = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange([]);
  };

  // Chọn tất cả (filtered)
  const handleSelectAll = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const allFilteredValues = filteredOptions.map((opt) => opt.value);
    const newValues = [...new Set([...selectedValues, ...allFilteredValues])];
    onChange(newValues);
  };

  return (
    <div className="multi-select-with-search">
      <Form.Label>{label}</Form.Label>
      
      {/* Hiển thị các item đã chọn */}
      <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
        {selectedItems.length === 0 ? (
          <span className="text-muted small">Chưa chọn item nào</span>
        ) : (
          <>
            {selectedItems.map((item) => (
              <Badge
                key={item.value}
                bg="primary"
                className="d-flex align-items-center gap-1"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
              >
                <span>{item.label}</span>
                <i 
                  className="bi bi-x"
                  style={{ cursor: "pointer", fontSize: "1.2rem" }}
                  onClick={(e) => handleRemoveItem(item.value, e)}
                />
              </Badge>
            ))}
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0"
              onClick={handleClearAll}
            >
              Xóa tất cả
            </Button>
          </>
        )}
      </div>

      {/* Ô tìm kiếm và dropdown */}
      <div className="position-relative">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
          />
          {searchTerm && (
            <Button
              variant="outline-secondary"
              onClick={() => setSearchTerm("")}
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </InputGroup>

        {/* Dropdown danh sách */}
        {showDropdown && (
          <div
            className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
            style={{ zIndex: 1000, maxHeight, overflowY: "auto" }}
          >
            {/* Header với nút chọn tất cả */}
            <div className="p-2 border-bottom bg-light d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {filteredOptions.length} kết quả
              </small>
              <div className="d-flex gap-2">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none"
                  onClick={handleSelectAll}
                >
                  Chọn tất cả
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none text-danger"
                  onClick={() => setShowDropdown(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>

            {/* Danh sách options */}
            <ListGroup variant="flush">
              {filteredOptions.length === 0 ? (
                <ListGroup.Item className="text-center text-muted">
                  Không tìm thấy kết quả
                </ListGroup.Item>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <ListGroup.Item
                      key={option.value}
                      action
                      active={isSelected}
                      onClick={(e) =>
                        isSelected
                          ? handleRemoveItem(option.value, e)
                          : handleAddItem(option.value, e)
                      }
                      className="d-flex justify-content-between align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <span>{option.label}</span>
                      {isSelected ? (
                        <i className="bi bi-dash-circle text-white"></i>
                      ) : (
                        <i className="bi bi-plus-circle text-primary"></i>
                      )}
                    </ListGroup.Item>
                  );
                })
              )}
            </ListGroup>
          </div>
        )}
      </div>

      {/* Overlay để đóng dropdown khi click bên ngoài */}
      {showDropdown && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default MultiSelectWithSearch;
