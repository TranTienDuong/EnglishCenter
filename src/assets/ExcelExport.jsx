import React, { useState } from "react";
import ExcelJS from "exceljs";
import FileSaver from "file-saver";

const ExcelExport = ({ columns, data, title, fileName }) => {
  const [hover, setHover] = useState(false);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    // Add title row with merged cells
    const titleRow = worksheet.addRow([title]);
    titleRow.getCell(1).font = { bold: true, size: 16 };
    worksheet.mergeCells(1, 1, 1, columns.length);

    // Add headers
    worksheet.addRow(columns.map((col) => col.header));

    // Add data
    data.forEach((row) => {
      const rowData = columns.map((col) => {
        if (typeof col.accessor === "function") {
          return col.accessor(row);
        }
        return row[col.accessor];
      });
      worksheet.addRow(rowData);
    });

    // Apply styles to all cells in each column
    columns.forEach((_, index) => {
      const column = worksheet.getColumn(index + 1);
      column.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (cell.row === 2) {
          cell.font = { bold: true, color: { argb: "FFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "006400" },
          };
        } else if (cell.row > 2) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      });
    });

    // Auto-fit columns
    columns.forEach((col, index) => {
      const column = worksheet.getColumn(index + 1);
      const maxLength = Math.max(
        col.header.length,
        ...data.map((row) => String(row[col.accessor] || "").length)
      );
      column.width = Math.max(maxLength + 2, 30);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = ".xlsx";
    const blob = new Blob([buffer], { type: fileType });

    FileSaver.saveAs(blob, (fileName || "export") + fileExtension);
  };

  return (
    <button
      onClick={exportToExcel}
      onMouseEnter={() => setHover(true)}
  onMouseLeave={() => setHover(false)}
      style={{
    padding: '10px',
    width: '30%',
    borderRadius: '5px',
    backgroundColor: 'green',
    color: 'white',
    transition: 'transform 0.2s ease-out',
    cursor: 'pointer',
    marginLeft: '20px',
    marginRight: '20px',
    transform: hover ? 'scale(1.05)' : 'scale(1)',
    border: 'none',
      }}
    >
      Xuất file Excel
    </button>
  );
};

export default ExcelExport;